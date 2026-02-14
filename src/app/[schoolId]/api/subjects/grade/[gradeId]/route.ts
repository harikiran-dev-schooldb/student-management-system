import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { gradeId } = await params;

  try {
    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(gradeId) },
      include: { subjects: true },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ subjects: grade.subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
