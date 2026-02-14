import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const grades = await prisma.grade.findMany({ orderBy: { id: "asc" } });

    for (let i = 0; i < grades.length - 1; i++) {
      const fromGrade = grades[i];
      const toGrade = grades[i + 1];

      // Pick first available class in next grade (can be improved to pick by section)
      const toClass = await prisma.class.findFirst({
        where: { gradeId: toGrade.id },
        orderBy: { section: "asc" },
      });

      if (!toClass) continue;

      const students = await prisma.student.findMany({
        where: { Class: { gradeId: fromGrade.id }, status: "ACTIVE" },
      });

      if (students.length === 0) continue;

      await prisma.$transaction(
        students.map((student) =>
          prisma.student.update({
            where: { id: student.id },
            data: { classId: toClass.id },
          })
        )
      );
    }

    return NextResponse.json({ success: true, message: "All students promoted successfully." });
  } catch (err) {
    console.error("Promotion error:", err);
    return NextResponse.json({ error: "Failed to promote all students." }, { status: 500 });
  }
}
