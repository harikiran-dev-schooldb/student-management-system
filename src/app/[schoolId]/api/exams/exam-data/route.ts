import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const { searchParams } = new URL(request.url);

    const examTitle = searchParams.get("examTitle");
    const classIdParam = searchParams.get("classId");

    if (!examTitle || !classIdParam) {
      return NextResponse.json(
        { error: "examTitle and classId are required" },
        { status: 400 }
      );
    }

    const classId = Number(classIdParam);
    if (Number.isNaN(classId)) {
      return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
    }

    /* ─────────────────────────────
       1️⃣ Resolve CLASS → GRADE (tenant safe)
    ───────────────────────────── */
    const cls = await prisma.class.findFirst({
      where: { id: classId, schoolId },
      select: { id: true, gradeId: true },
    });

    if (!cls?.gradeId) {
      return NextResponse.json(
        { error: "Class not found for this school" },
        { status: 404 }
      );
    }

    const gradeId = cls.gradeId;

    /* ─────────────────────────────
       2️⃣ Resolve EXAM by title (tenant safe)
    ───────────────────────────── */
    const exam = await prisma.exam.findUnique({
      where: {
        title_schoolId: {
          title: examTitle,
          schoolId,
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found for this school" },
        { status: 404 }
      );
    }

    /* ─────────────────────────────
       3️⃣ ExamGradeSubject (tenant safe)
    ───────────────────────────── */
    const examGradeSubjects = await prisma.examGradeSubject.findMany({
      where: {
        examId: exam.id,
        gradeId,
        schoolId,
      },
      include: {
        Subject: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        Subject: { name: "asc" },
      },
    });

    if (examGradeSubjects.length === 0) {
      return NextResponse.json(
        { error: "Exam not configured for this grade" },
        { status: 404 }
      );
    }

    /* ─────────────────────────────
       4️⃣ Subjects + maxMarks
    ───────────────────────────── */
    const subjects = examGradeSubjects.map((egs) => ({
      id: egs.Subject.id,
      name: egs.Subject.name,
      maxMarks: egs.maxMarks,
    }));

    /* ─────────────────────────────
       5️⃣ Students + existing results (tenant safe)
    ───────────────────────────── */
    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: {
        id: true,
        name: true,
        results: {
          where: { examId: exam.id },
          select: {
            marks: true,
            subjectId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    /* ─────────────────────────────
       6️⃣ Transform existing marks
    ───────────────────────────── */
    const existingMarks: Record<string, Record<string, string>> = {};

    for (const student of students) {
      const marksMap: Record<string, string> = {};

      for (const r of student.results) {
        const subj = subjects.find((s) => s.id === r.subjectId);
        if (subj) {
          marksMap[subj.name] = String(r.marks);
        }
      }

      if (Object.keys(marksMap).length > 0) {
        existingMarks[student.id] = marksMap;
      }
    }

    return NextResponse.json({
      examId: exam.id,
      gradeId,
      classId,
      subjects,
      students: students.map((s) => ({ id: s.id, name: s.name })),
      existingMarks,
    });
  } catch (error) {
    console.error("❌ exam-data error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
