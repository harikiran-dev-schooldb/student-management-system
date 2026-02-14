import { examSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await context.params;
    const examId = parseInt(id);

    if (isNaN(examId)) {
      return NextResponse.json(
        { error: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = examSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const {
      title,
      examDate,
      startTime,
      gradeId,
      subjectId,
      maxMarks,
    } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // Ensure exam belongs to this school
      const existingExam = await tx.exam.findFirst({
        where: {
          id: examId,
          schoolId,
        },
      });

      if (!existingExam) {
        throw new Error("Exam not found for this school");
      }

      // Update exam title
      const updatedExam = await tx.exam.update({
        where: { id: examId },
        data: { title },
      });

      // Upsert exam-grade-subject safely
      await tx.examGradeSubject.upsert({
        where: {
          examId_gradeId_subjectId_schoolId: {
            examId,
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
          examId,
          gradeId,
          subjectId,
          schoolId,
          date: new Date(examDate),
          startTime,
          maxMarks,
        },
      });

      return updatedExam;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Exam updated successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[UPDATE_EXAM_ERROR]", error);
    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await context.params;
    const examId = parseInt(id);

    if (isNaN(examId)) {
      return NextResponse.json(
        { error: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const deleted = await prisma.exam.deleteMany({
      where: {
        id: examId,
        schoolId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Exam not found for this school" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Exam deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[DELETE_EXAM_ERROR]", error);
    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
