import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: { userId: string } }
) {
  // ✅ IMPORTANT: await params
  const { userId } = await Promise.resolve(context.params);

  const student = await prisma.student.findUnique({
    where: {
      id: userId, // ✅ UNIQUE
    },
    select: { id: true },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ studentId: student.id });
}
