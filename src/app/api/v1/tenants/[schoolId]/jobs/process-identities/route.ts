export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import pLimit from "p-limit";
import { createOrUpdateIdentityScript } from "@/lib/services/identity.script";

const CONCURRENCY = 2;
const BATCH_SIZE = 50;
const DELAY = 150;
const TEST_LIMIT = 200;
let createdCount = 0;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function retry(fn: any, retries = 3) {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && err?.status === 429) {
      await sleep(1000);
      return retry(fn, retries - 1);
    }
    throw err;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> },
) {

  const { schoolId: slug } = await params;

  const schoolId = await resolveSchoolId(slug);

  const job = await prisma.identityBackfillJob.findFirst({
    where: { schoolId, status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    return Response.json({ message: "No pending jobs" });
  }

  await prisma.identityBackfillJob.update({
    where: { id: job.id },
    data: { status: "processing" },
  });

  const total = await prisma.student.count({ where: { schoolId } });

  let processed = 0;
  let success = 0;
  let failed = 0;

  const limit = pLimit(CONCURRENCY);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {

    const students = await prisma.student.findMany({
      where: { schoolId },
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

          // 🔥 stop creating more
          if (createdCount >= TEST_LIMIT) return;

          const username = `s${s.admissionNo}`;
          const phone = s.phone?.replace(/\D/g, "").slice(-10);

          if (!phone || phone.length !== 10) return;

          try {
            const existing = await prisma.profile.findUnique({
              where: { phone },
              select: { clerk_id: true },
            });

            // skip existing users
            if (existing?.clerk_id) return;

            await retry(() =>
              createOrUpdateIdentityScript({
                username,
                phone,
                name: s.name,
                role: "student",
                schoolId,
              })
            );

            createdCount++; // ✅ only count successful creations

          } catch (err: any) {
            console.error("❌", username, err?.message);
          }

          await sleep(DELAY);
        })
      )
    );
  }

  await prisma.identityBackfillJob.update({
    where: { id: job.id },
    data: {
      status: "completed",
      processed,
      success,
      failed,
      total,
    },
  });

  return Response.json({ message: "Job completed" });
}