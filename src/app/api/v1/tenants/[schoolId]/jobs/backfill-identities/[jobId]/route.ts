import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {

  const { jobId } = await params;

  const job = await prisma.identityBackfillJob.findUnique({
    where: { id: jobId },
  });

  return Response.json(job);
}