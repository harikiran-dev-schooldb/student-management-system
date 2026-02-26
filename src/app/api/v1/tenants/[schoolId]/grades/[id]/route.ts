export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { NextRequest, NextResponse } from "next/server";

/* =======================
   GET SINGLE GRADE
======================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id: gradeId } = await params;
    const parsedGradeId = parseInt(gradeId, 10);

    if (Number.isNaN(parsedGradeId)) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }

    const schoolId = await resolveSchoolId(slug);

    const grade = await prisma.grade.findFirst({
      where: {
        id: parsedGradeId,
        schoolId,
      },
      include: {
        subjects: true,
        classes: {
          include: {
            students: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    const students = grade.classes.flatMap(c => c.students);

    return NextResponse.json({
      id: grade.id,
      level: grade.level,
      subjects: grade.subjects,
      students,
    });

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("Grade Details API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch grade details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id: gradeId } = await params;
    const parsedGradeId = parseInt(gradeId, 10);

    if (Number.isNaN(parsedGradeId)) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }

    const { level } = await req.json();

    if (!level || typeof level !== "string") {
      return NextResponse.json(
        { error: "Level is required" },
        { status: 400 }
      );
    }

    const schoolId = await resolveSchoolId(slug);

    const grade = await prisma.grade.findFirst({
      where: {
        id: parsedGradeId,
        schoolId,
      },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.grade.findFirst({
      where: {
        level: level.trim(),
        schoolId,
        NOT: { id: parsedGradeId },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Grade level already exists" },
        { status: 409 }
      );
    }

    const updated = await prisma.grade.update({
      where: { id: parsedGradeId },
      data: { level: level.trim() },
    });

    return NextResponse.json(updated);

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("Update Grade Error:", error);

    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id: gradeId } = await params;
    const parsedGradeId = parseInt(gradeId, 10);

    if (Number.isNaN(parsedGradeId)) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }

    // 🔎 Resolve tenant
    const schoolId = await resolveSchoolId(slug);

    // 🔐 Ensure grade belongs to this school
    const grade = await prisma.grade.findFirst({
      where: {
        id: parsedGradeId,
        schoolId,
      },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    // 🔍 Check ALL dependencies in parallel
    const [
      classCount,
      subjectCount,
      examGradeCount,
      feeStructureCount,
      homeworkCount,
    ] = await Promise.all([
      prisma.class.count({
        where: { gradeId: parsedGradeId, schoolId },
      }),
      prisma.subject.count({
        where: {
          schoolId,
          grades: { some: { id: parsedGradeId } },
        },
      }),
      prisma.examGradeSubject.count({
        where: { gradeId: parsedGradeId, schoolId },
      }),
      prisma.feeStructure.count({
        where: { gradeId: parsedGradeId, schoolId },
      }),
      prisma.homework.count({
        where: { gradeId: parsedGradeId, schoolId },
      }),
    ]);

    // 🚫 Block deletion if linked
    if (
      classCount > 0 ||
      subjectCount > 0 ||
      examGradeCount > 0 ||
      feeStructureCount > 0 ||
      homeworkCount > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete grade. It is linked to classes, subjects, exams, fees, or homework.",
          details: {
            classes: classCount,
            subjects: subjectCount,
            exams: examGradeCount,
            feeStructures: feeStructureCount,
            homeworks: homeworkCount,
          },
        },
        { status: 400 }
      );
    }

    // 🗑 Safe to delete
    await prisma.grade.delete({
      where: { id: parsedGradeId },
    });

    return NextResponse.json({
      message: "Grade deleted successfully",
    });

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("Delete Grade Error:", error);

    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}


