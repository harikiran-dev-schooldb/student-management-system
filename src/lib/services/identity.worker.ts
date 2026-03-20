import prisma from "@/lib/prisma";
import { createOrUpdateIdentityScript } from "@/lib/services/identity.script";
import pLimit from "p-limit";

export async function processIdentityJobs() {

  const jobs = await prisma.$transaction(async (tx) => {

    const jobs = await tx.identityJob.findMany({
      where: { status: "pending" },
      take: 20,
    });

    const lockedIds: string[] = [];

    for (const job of jobs) {
      const res = await tx.identityJob.updateMany({
        where: { id: job.id, status: "pending" },
        data: { status: "processing" },
      });

      if (res.count === 1) lockedIds.push(job.id);
    }

    return tx.identityJob.findMany({
      where: { id: { in: lockedIds } },
    });
  });

  const limit = pLimit(5);

  await Promise.all(
    jobs.map(job =>
      limit(async () => {
        try {

          const normalizedPhone = job.phone.replace(/\D/g, "").slice(-10);

          if (normalizedPhone.length !== 10) {
            throw new Error("Invalid phone");
          }

          await createOrUpdateIdentityScript({
            username: job.username,
            phone: normalizedPhone,
            name: job.name,
            role: job.role as any,
            schoolId: job.schoolId,
          });

          await prisma.identityJob.update({
            where: { id: job.id },
            data: { status: "done" },
          });

        } catch (error: any) {

          const nextAttempts = job.attempts + 1;

          await prisma.identityJob.update({
            where: { id: job.id },
            data: {
              status: nextAttempts >= 3 ? "failed" : "pending",
              attempts: nextAttempts,
              error: error?.message,
              nextRunAt: new Date(Date.now() + nextAttempts * 60000),
            },
          });

        }
      })
    )
  );
}