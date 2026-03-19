export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(params.schoolId);

    const job = await prisma.identityBackfillJob.create({
      data: {
        schoolId,
        status: "pending",
      },
    });

    return Response.json({
      message: "Job created",
      jobId: job.id,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}