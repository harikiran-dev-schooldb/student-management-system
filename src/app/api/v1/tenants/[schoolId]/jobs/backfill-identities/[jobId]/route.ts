import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const job = await prisma.identityBackfillJob.findUnique({
    where: { id: params.jobId },
  });

  return Response.json(job);
}