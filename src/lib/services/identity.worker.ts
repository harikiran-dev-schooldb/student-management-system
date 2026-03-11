import prisma from "@/lib/prisma";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

export async function processIdentityJobs() {

  const jobs = await prisma.identityJob.findMany({
    where: { status: "pending" },
    take: 20,
  });

  for (const job of jobs) {

    try {

      await prisma.identityJob.update({
        where: { id: job.id },
        data: { status: "processing" },
      });

      await createOrUpdateIdentity({
        username: job.username,
        phone: job.phone,
        name: job.name,
        role: job.role as any,
        schoolId: job.schoolId,
      });

      await prisma.identityJob.update({
        where: { id: job.id },
        data: { status: "done" },
      });

    } catch (error: any) {

      await prisma.identityJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          attempts: { increment: 1 },
          error: error?.message,
        },
      });

    }

  }
}