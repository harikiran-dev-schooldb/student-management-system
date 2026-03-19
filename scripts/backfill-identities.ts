import "dotenv/config";

import prisma from "../src/lib/prisma";
import { createOrUpdateIdentityScript } from "../src/lib/services/identity.script";
import pLimit from "p-limit";

const BATCH_SIZE = 50;       // smaller batch = safer
const CONCURRENCY = 2;       // reduce pressure on Clerk
const DELAY_MS = 150;        // throttle per request
const MAX_RETRIES = 4;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function retry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err?.status || err?.statusCode;

    // Retry only for rate limits
    if (status === 429 && attempt <= MAX_RETRIES) {
      const backoff = attempt * 1000;
      console.log(`⏳ Retry ${attempt} after ${backoff}ms`);
      await sleep(backoff);
      return retry(fn, attempt + 1);
    }

    throw err;
  }
}

async function main() {
  console.log("🚀 Starting Clerk identity backfill...\n");

  const total = await prisma.student.count();
  console.log(`📊 Total students: ${total}\n`);

  let processed = 0;
  let success = 0;
  let skipped = 0;
  let failed = 0;

  const limit = pLimit(CONCURRENCY);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const students = await prisma.student.findMany({
      skip,
      take: BATCH_SIZE,
      select: {
        admissionNo: true,
        name: true,
        phone: true,
        schoolId: true,
      },
    });

    console.log(`📦 Batch ${skip} → ${skip + students.length}`);

    await Promise.all(
      students.map((s) =>
        limit(async () => {
          const username = `s${s.admissionNo}`;
          const phone = s.phone?.replace(/\D/g, "").slice(-10);

          if (!phone || phone.length !== 10) {
            console.log(`⚠️ Invalid phone: ${s.phone}`);
            failed++;
            processed++;
            return;
          }

          try {
            // ✅ Skip if already linked
            const existingProfile = await prisma.profile.findUnique({
              where: { phone },
              select: { clerk_id: true },
            });

            if (existingProfile?.clerk_id) {
              skipped++;
              processed++;
              return;
            }

            // ✅ Retry-safe Clerk call
            await retry(() =>
              createOrUpdateIdentityScript({
                username,
                phone,
                name: s.name,
                role: "student",
                schoolId: s.schoolId,
              })
            );

            success++;
          } catch (err: any) {
            failed++;
            console.error(`❌ ${s.admissionNo} → ${err?.message}`);
          }

          processed++;

          // ✅ Throttle
          await sleep(DELAY_MS);

          if (processed % 50 === 0) {
            console.log(
              `📊 Progress: ${processed}/${total} | ✅ ${success} | ⏭ ${skipped} | ❌ ${failed}`
            );
          }
        })
      )
    );
  }

  console.log("\n🎉 BACKFILL COMPLETE");
  console.log(`✅ Success: ${success}`);
  console.log(`⏭ Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total processed: ${processed}`);
}

main()
  .catch((err) => {
    console.error("🔥 Fatal error:", err);
  })
  .finally(() => process.exit(0));


  // npx tsx scripts/backfill-identities.ts