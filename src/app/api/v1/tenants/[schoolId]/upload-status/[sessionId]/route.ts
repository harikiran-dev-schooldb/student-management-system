import prisma from "@/lib/prisma";

export async function GET(_: Request, { params }: any) {
  const session = await prisma.uploadSession.findUnique({
    where: { id: params.sessionId },
  });

  return Response.json(session);
}