import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function PUT(
  req: NextRequest,
  context: { params: { schoolId: string; examId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);
    const examId = Number(context.params.examId);

    const { gradeId, subjectId, examDate, startTime, maxMarks } =
      await req.json();

    const schedule = await prisma.examGradeSubject.findFirst({
      where: {
        examId,
        gradeId,
        subjectId,
        schoolId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Exam schedule not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.examGradeSubject.update({
      where: {
        examId_gradeId_subjectId_schoolId: {
          examId,
          gradeId,
          subjectId,
          schoolId,
        },
      },
      data: {
        date: new Date(examDate),
        startTime,
        maxMarks,
      },
    });

    return NextResponse.json({ success: true, updated });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update exam schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { schoolId: string; examId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);
    const examId = Number(context.params.examId);

    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const resultCount = await prisma.result.count({
      where: { examId, schoolId },
    });

    if (resultCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete exam with published results" },
        { status: 400 }
      );
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    return NextResponse.json({ message: "Exam deleted successfully" });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
