import prisma from "@/lib/prisma";
import pLimit from "p-limit";
import { createOrUpdateIdentityScript } from "@/lib/services/identity.script";

const CONCURRENCY = 2;
const DELAY = 150;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function runBackfill(jobId: string) {

  const job = await prisma.identityBackfillJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return;

  const total = await prisma.student.count();

  await prisma.identityBackfillJob.update({
    where: { id: jobId },
    data: { total, status: "processing" },
  });

  let processed = 0;
  let success = 0;
  let failed = 0;

  const limit = pLimit(CONCURRENCY);
  const BATCH_SIZE = 50;

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

    await Promise.all(
      students.map((s) =>
        limit(async () => {
          try {
            const phone = s.phone.replace(/\D/g, "").slice(-10);

            if (phone.length !== 10) {
              failed++;
              return;
            }

            await createOrUpdateIdentityScript({
              username: `s${s.admissionNo}`,
              phone,
              name: s.name,
              role: "student",
              schoolId: s.schoolId,
            });

            success++;

          } catch (err) {
            failed++;
          }

          processed++;

          await sleep(DELAY);

          // 🔥 update progress every 20 records
          if (processed % 20 === 0) {
            await prisma.identityBackfillJob.update({
              where: { id: jobId },
              data: { processed, success, failed },
            });
          }
        })
      )
    );
  }

  await prisma.identityBackfillJob.update({
    where: { id: jobId },
    data: {
      status: "completed",
      processed,
      success,
      failed,
    },
  });
}