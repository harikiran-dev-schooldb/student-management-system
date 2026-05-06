export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { classSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const body = await req.json();

    /* -------------------------------
       BULK INSERT
    -------------------------------- */

    if (Array.isArray(body.classes)) {

      const classes = body.classes;

      const grades = await prisma.grade.findMany({
        where: { schoolId },
        select: { id: true, level: true },
      });

      const gradeMap = new Map(grades.map(g => [g.id, g]));

      const insertData = [];

      for (const cls of classes) {

        const grade = gradeMap.get(Number(cls.gradeId));
        if (!grade) continue;

        const section = cls.section?.trim().toUpperCase();
        if (!section) continue;

        insertData.push({
          gradeId: grade.id,
          schoolId,
          section,
          name: `${grade.level} - ${section}`,
        });

      }

      const result = await prisma.class.createMany({
        data: insertData,
        skipDuplicates: true,
      });

      return NextResponse.json({
        type: "bulk",
        inserted: result.count,
        received: classes.length,
      });

    }

    /* -------------------------------
       SINGLE UPSERT
    -------------------------------- */

    const parsed = classSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { section, gradeId, supervisorId } = parsed.data;

    const grade = await prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
      select: { id: true, level: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid gradeId" },
        { status: 400 }
      );
    }

    const normalizedSection = section.trim().toUpperCase();

    const createdClass = await prisma.class.upsert({
      where: {
        gradeId_section_schoolId: {
          gradeId,
          section: normalizedSection,
          schoolId,
        },
      },
      update: {},
      create: {
        gradeId,
        schoolId,
        section: normalizedSection,
        name: `${grade.level} - ${normalizedSection}`,
      },
    });

    /* assign supervisor */

    if (supervisorId) {

      const activeYear = await prisma.academicYear.findFirst({
        where: {
          schoolId,
          isActive: true,
        },
        select: { id: true },
      });

      if (activeYear) {

        await prisma.teacherClassAssignment.upsert({
          where: {
            teacherId_classId_academicYearId_schoolId: {
              teacherId: supervisorId,
              classId: createdClass.id,
              academicYearId: activeYear.id,
              schoolId,
            },
          },
          update: {},
          create: {
            teacherId: supervisorId,
            classId: createdClass.id,
            academicYearId: activeYear.id,
            schoolId,
            role: "SUPERVISOR",
          },
        });

      }

    }

    return NextResponse.json({
      type: "single",
      data: createdClass,
    }, { status: 201 });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Class creation failed" },
      { status: 500 }
    );

  }
}

/* ======================================================
   GET → Fetch Classes (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const { searchParams } = new URL(req.url);

    const gradeId = searchParams.get("gradeId");
    const branchId = searchParams.get("branchId");

    const where: any = {
      schoolId,
    };

    /* ---------------- FILTER BY GRADE ---------------- */
    if (gradeId) {
      where.gradeId = Number(gradeId);
    }

    /* ---------------- FILTER BY BRANCH ---------------- */
    if (branchId) {
  where.Grade = {
    is: {
      branchId: Number(branchId),
    },
  };
}

    const classes = await prisma.class.findMany({
      where,
      select: {
        id: true,
        name: true,
        gradeId: true,
        section: true,
        Grade: {
          select: {
            id: true,
            level: true,
            branchId: true,
          },
        },
      },
      orderBy: [
        { gradeId: "asc" },
        { section: "asc" },
      ],
    });

    return NextResponse.json({
      data: classes,
    });

  } catch (error) {
    console.error("GET classes error:", error);

    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}