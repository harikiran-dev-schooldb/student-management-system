export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

/* =======================
   GET SINGLE GRADE
======================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const schoolId = access.schoolId;
    const gradeId = Number(id);

    if (isNaN(gradeId)) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }


    const db = tenantPrisma(schoolId);

    const grade = await db.grade.findFirst({
      where: {
        id: gradeId,
        schoolId,
      },
      select: {
        id: true,
        level: true,

        subjects: {
          select: {
            id: true,
            name: true,
          },
        },

        classes: {
          select: {
            id: true,
            name: true,
            section: true,

            studentEnrollments: {
              where: {
                status: "ACTIVE",
              },
              select: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    admissionNo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    const students = grade.classes.flatMap((c) =>
      c.studentEnrollments.map((e) => e.student)
    );

    return NextResponse.json({
      id: grade.id,
      level: grade.level,
      subjects: grade.subjects,
      students,
    });

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Grade Details API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch grade details" },
      { status: 500 }
    );
  }
}

/* =======================
   UPDATE GRADE
======================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id } = await params;
    const gradeId = Number(id);

    if (Number.isNaN(gradeId)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const { level } = await req.json();

    if (!level || typeof level !== "string") {
      return NextResponse.json({ error: "Level is required" }, { status: 400 });
    }

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const existing = await db.grade.findFirst({
      where: { id: gradeId, schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    const duplicate = await db.grade.findFirst({
      where: {
        level: level.trim(),
        schoolId,
        NOT: { id: gradeId },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Grade level already exists" },
        { status: 409 }
      );
    }

    const updated = await db.grade.update({
      where: { id: gradeId },
      data: { level: level.trim() },
    });

    return NextResponse.json(updated);

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Update Grade Error:", error);

    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE GRADE
======================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id } = await params;
    const gradeId = Number(id);

    if (Number.isNaN(gradeId)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const grade = await db.grade.findFirst({
      where: { id: gradeId, schoolId },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    /* Check dependencies */

    const [
      classCount,
      subjectCount,
      examGradeCount,
      feeStructureCount,
      homeworkCount,
    ] = await Promise.all([
      db.class.count({
        where: { gradeId, schoolId },
      }),
      db.subject.count({
        where: {
          schoolId,
          grades: { some: { id: gradeId } },
        },
      }),
      db.examGradeSubject.count({
        where: { gradeId, schoolId },
      }),
      db.feeStructure.count({
        where: { gradeId, schoolId },
      }),
      db.homework.count({
        where: { gradeId, schoolId },
      }),
    ]);

    if (
      classCount ||
      subjectCount ||
      examGradeCount ||
      feeStructureCount ||
      homeworkCount
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete grade. It has linked data.",
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

    await db.grade.delete({
      where: { id: gradeId },
    });

    return NextResponse.json({
      message: "Grade deleted successfully",
    });

  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Delete Grade Error:", error);

    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}