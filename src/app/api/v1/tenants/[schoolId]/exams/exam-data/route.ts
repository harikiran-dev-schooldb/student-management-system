import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

    const { searchParams } = new URL(req.url);
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

    /* 1️⃣ Resolve Class → Grade */
    const cls = await prisma.class.findFirst({
      where: { id: classId, schoolId },
      select: { gradeId: true },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found for this school" },
        { status: 404 }
      );
    }

    /* 2️⃣ Resolve Exam */
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
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    /* 3️⃣ Exam Schedule */
    const examGradeSubjects = await prisma.examGradeSubject.findMany({
      where: {
        examId: exam.id,
        gradeId: cls.gradeId,
        schoolId,
      },
      include: {
        Subject: { select: { id: true, name: true } },
      },
      orderBy: { Subject: { name: "asc" } },
    });

    if (!examGradeSubjects.length) {
      return NextResponse.json(
        { error: "Exam not configured for this grade" },
        { status: 404 }
      );
    }

    const subjects = examGradeSubjects.map((egs) => ({
      id: egs.Subject.id,
      name: egs.Subject.name,
      maxMarks: egs.maxMarks,
    }));

    /* 4️⃣ Students + Existing Results */
    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: {
        id: true,
        name: true,
        results: {
          where: { examId: exam.id, schoolId },
          select: { subjectId: true, marks: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const existingMarks: Record<string, Record<string, string>> = {};

    for (const student of students) {
      const map: Record<string, string> = {};

      for (const r of student.results) {
        const subj = subjects.find((s) => s.id === r.subjectId);
        if (subj) {
          map[subj.name] = String(r.marks);
        }
      }

      if (Object.keys(map).length) {
        existingMarks[student.id] = map;
      }
    }

    return NextResponse.json({
      examId: exam.id,
      gradeId: cls.gradeId,
      classId,
      subjects,
      students: students.map((s) => ({ id: s.id, name: s.name })),
      existingMarks,
    });

  } catch (error) {
    console.error("exam-data error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
