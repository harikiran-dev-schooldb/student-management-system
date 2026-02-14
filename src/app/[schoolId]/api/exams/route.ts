import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { examSchema } from "@/lib/formValidationSchemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const json = await request.json();
    const parsed = examSchema.parse(json);

    const {
      title,
      examDate,
      startTime,
      gradeId,
      subjectId,
      maxMarks,
    } = parsed;

    const exam = await prisma.$transaction(async (tx) => {
      /* ─────────────────────────────
         1️⃣ Find exam (tenant safe)
      ───────────────────────────── */
      let existingExam = await tx.exam.findUnique({
        where: {
          title_schoolId: {
            title,
            schoolId,
          },
        },
      });

      if (!existingExam) {
        existingExam = await tx.exam.create({
          data: {
            title,
            schoolId,
          },
        });
      }

      /* ─────────────────────────────
         2️⃣ Upsert ExamGradeSubject
         (unique: examId, gradeId, subjectId, schoolId)
      ───────────────────────────── */
      await tx.examGradeSubject.upsert({
        where: {
          examId_gradeId_subjectId_schoolId: {
            examId: existingExam.id,
            gradeId,
            subjectId,
            schoolId,
          },
        },
        update: {
          date: new Date(examDate),
          startTime,
          maxMarks,
        },
        create: {
          examId: existingExam.id,
          gradeId,
          subjectId,
          date: new Date(examDate),
          startTime,
          maxMarks,
          schoolId,
        },
      });

      return existingExam;
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });

  } catch (err) {
    console.error("[EXAM_POST_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const exams = await prisma.exam.findMany({
      where: { schoolId },
      include: {
        examGradeSubjects: {
          where: { schoolId },
          include: {
            Grade: true,
            Subject: true,
          },
        },
      },
    });

    return NextResponse.json({ exams }, { status: 200 });

  } catch (err) {
    console.error("[EXAM_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
