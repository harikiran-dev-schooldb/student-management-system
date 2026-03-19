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
const MAX_PER_RUN = 50;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;

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
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId: slug } = await params;
  const schoolId = await resolveSchoolId(slug);

  const job = await prisma.identityBackfillJob.findFirst({
    where: { schoolId, status: { in: ["pending", "processing"] } },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    return Response.json({ message: "No job found" });
  }

  await prisma.identityBackfillJob.update({
    where: { id: job.id },
    data: { status: "processing" },
  });

  const total = await prisma.student.count({ where: { schoolId } });

  let processedThisRun = 0;
  let createdThisRun = 0;

  const limit = pLimit(CONCURRENCY);

  for (let skip = job.processed; skip < total; skip += BATCH_SIZE) {

    if (processedThisRun >= MAX_PER_RUN) break;
    if (job.success >= TEST_LIMIT) break;

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

          if (processedThisRun >= MAX_PER_RUN) return;
          if (job.success + createdThisRun >= TEST_LIMIT) return;

          const username = `s${s.admissionNo}`;
          const phone = s.phone?.replace(/\D/g, "").slice(-10);

          if (!phone || phone.length !== 10) return;

          try {
            const existing = await prisma.profile.findUnique({
              where: { phone },
              select: { clerk_id: true },
            });

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

            createdThisRun++;

          } catch (err: any) {
            console.error("❌", username, err?.message);
          }

          processedThisRun++;
          await sleep(DELAY);
        })
      )
    );
  }

  // 🔄 update progress
  const updatedJob = await prisma.identityBackfillJob.update({
    where: { id: job.id },
    data: {
      processed: { increment: processedThisRun },
      success: { increment: createdThisRun },
      total,
      status:
        job.success + createdThisRun >= TEST_LIMIT ||
        job.processed + processedThisRun >= total
          ? "completed"
          : "processing",
    },
  });

  // 🔁 trigger next run ONLY if needed
  if (updatedJob.status !== "completed") {
    fetch(
      `${BASE_URL}/api/v1/tenants/${slug}/jobs/process-identities`
    ).catch(() => {});
  }

  return Response.json({
    message: "Processed batch",
    processedThisRun,
    createdThisRun,
  });
}