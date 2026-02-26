export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { classSchema } from "@/lib/formValidationSchemas";

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

    const where: any = { schoolId };

    if (gradeIdParam) {
      const parsed = Number(gradeIdParam);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ error: "Invalid gradeId" }, { status: 400 });
      }
      where.gradeId = parsed;
    }

    if (teacherIdParam) {
      where.supervisorId = teacherIdParam;
    }

    const classes = await prisma.class.findMany({
      where,
      orderBy: [{ gradeId: "asc" }, { section: "asc" }],
      include: {
        Grade: { select: { id: true, level: true } },
        Teacher: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 },
    );
  }
}

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
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { section, gradeId, supervisorId } = parsed.data;

    const grade = await prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
    });

    if (!grade) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const name = `${grade.level} - ${section}`;

    if (supervisorId) {
      await prisma.class.updateMany({
        where: { supervisorId, schoolId },
        data: { supervisorId: null },
      });
    }

    const newClass = await prisma.class.create({
      data: {
        section,
        name,
        gradeId,
        supervisorId,
        schoolId,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Class already exists or supervisor assigned" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 },
    );
  }
}
