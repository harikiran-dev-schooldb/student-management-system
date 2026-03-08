export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { classSchema } from "@/lib/formValidationSchemas";
import { Prisma } from "@prisma/client";

export const revalidate = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const body = await req.json();

    const parsed = classSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { section, gradeId, supervisorId } = parsed.data;

    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        schoolId,
      },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 },
      );
    }

    const name = `${grade.level} - ${section}`;

    const newClass = await prisma.class.create({
      data: {
        section,
        name,
        gradeId,
        schoolId,
      },
    });

    /* Assign Supervisor */

    if (supervisorId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: {
          schoolId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!activeYear) {
        return NextResponse.json(
          { error: "No active academic year" },
          { status: 400 },
        );
      }

      await prisma.teacherClassAssignment.create({
        data: {
          teacherId: supervisorId,
          classId: newClass.id,
          academicYearId: activeYear.id,
          schoolId,
          role: "SUPERVISOR",
        },
      });
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Class already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { searchParams } = new URL(req.url);

    const gradeIdParam = searchParams.get("gradeId");
    const teacherIdParam = searchParams.get("teacherId");

    const where: Prisma.ClassWhereInput = {
      schoolId,
    };

    if (gradeIdParam) {
      const parsed = Number(gradeIdParam);

      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: "Invalid gradeId" },
          { status: 400 },
        );
      }

      where.gradeId = parsed;
    }

    if (teacherIdParam) {
      where.teacherClassAssignments = {
        some: {
          teacherId: teacherIdParam,
          role: "SUPERVISOR",
        },
      };
    }

    const classes = await prisma.class.findMany({
      where,
      orderBy: [
        { gradeId: "asc" },
        { section: "asc" },
      ],
      select: {
        id: true,
        name: true,
        section: true,
        gradeId: true,

        Grade: {
          select: {
            id: true,
            level: true,
          },
        },

        teacherClassAssignments: {
          where: { role: "SUPERVISOR" },
          select: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 },
    );
  }
}