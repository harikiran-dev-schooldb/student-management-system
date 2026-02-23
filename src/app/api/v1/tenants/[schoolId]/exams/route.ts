import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { examSchema } from "@/lib/formValidationSchemas";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";

/* ===============================
   POST  /exams
================================ */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const body = await req.json();
    const parsed = examSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { title, examDate, startTime, gradeId, subjectId, maxMarks } =
      parsed.data;

    /* ----- Validate Grade ----- */
    const grade = await prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade for this school" },
        { status: 400 },
      );
    }

    /* ----- Validate Subject belongs to Grade ----- */
    const subjectBelongsToGrade = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        schoolId,
        grades: { some: { id: gradeId } },
      },
      select: { id: true },
    });

    if (!subjectBelongsToGrade) {
      return NextResponse.json(
        { error: "Subject not assigned to this grade" },
        { status: 400 },
      );
    }

    const exam = await prisma.$transaction(async (tx) => {
      let existingExam = await tx.exam.findUnique({
        where: {
          title_schoolId: { title, schoolId },
        },
      });

      if (!existingExam) {
        existingExam = await tx.exam.create({
          data: { title, schoolId },
        });
      }

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
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("EXAM_POST_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 },
    );
  }
}

/* ===============================
   GET  /exams
================================ */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const { searchParams } = new URL(req.url);
    const onlyTitles = searchParams.get("titles") === "true";

    if (onlyTitles) {
      const titles = await prisma.exam.findMany({
        where: { schoolId },
        select: {
          id: true,
          title: true,
        },
        orderBy: { id: "desc" },
      });

      return NextResponse.json({ titles });
    }

    const exams = await prisma.exam.findMany({
      where: { schoolId },
      orderBy: { id: "desc" },
      include: {
        examGradeSubjects: {
          where: { schoolId },
          include: {
            Grade: { select: { id: true, level: true } },
            Subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}