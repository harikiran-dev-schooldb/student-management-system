export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { examSchema } from "@/lib/formValidationSchemas";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

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

    const db = tenantPrisma(schoolId);

    const user = await fetchUserInfo(slug);

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = examSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { title, examDate, startTime, gradeId, subjectId, maxMarks, academicYearId } =
      parsed.data;

    /* ----- Validate Grade ----- */
    const grade = await db.grade.findFirst({
      where: { id: gradeId, schoolId },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade for this school" },
        { status: 400 },
      );
    }

    const academicYear = await db.academicYear.findFirst({
      where: {
        id: academicYearId,
        schoolId,
      },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "Invalid academic year for this school" },
        { status: 400 }
      );
    }

    /* ----- Validate Subject belongs to Grade ----- */
    const subjectBelongsToGrade = await db.subject.findFirst({
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

    const exam = await db.$transaction(async (tx) => {
      let existingExam = await tx.exam.findUnique({
        where: {
          title_academicYearId_schoolId: { title, schoolId, academicYearId },
        },
      });

      if (!existingExam) {
        existingExam = await tx.exam.create({
          data: { title, schoolId, academicYearId },
        });
      }

      await tx.examGradeSubject.upsert({
        where: {
          examId_gradeId_subjectId_academicYearId_schoolId: {
            examId: existingExam.id,
            gradeId,
            subjectId,
            schoolId,
            academicYearId,
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
          academicYearId,
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
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);
    const onlyTitles = searchParams.get("titles") === "true";

    if (onlyTitles) {
      const titles = await db.exam.findMany({
        where: { schoolId },
        distinct: ["title"],
        select: {
          id: true,
          title: true,
        },
        orderBy: { id: "asc" },
      });

      return NextResponse.json({ titles });
    }

    const exams = await db.exam.findMany({
      where: { schoolId },
      orderBy: { id: "desc" },
      include: {
        examGradeSubjects: {
          where: { schoolId },
          select: {
            date: true,
            startTime: true,
            maxMarks: true,
          },
          include: {
            grade: { select: { id: true, level: true } },
            subject: { select: { id: true, name: true } },
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