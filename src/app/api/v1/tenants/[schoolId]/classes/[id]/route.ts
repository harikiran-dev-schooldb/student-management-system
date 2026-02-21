import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { classSchema } from "@/lib/formValidationSchemas";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  const { schoolId: schoolSlug, id: classIdString } = await params;
  const schoolId = await resolveSchoolId(schoolSlug);
  const classId = Number(classIdString);

  const cls = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    include: {
      Grade: true,
      Teacher: true,
    },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  return NextResponse.json(cls);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  const { schoolId: schoolSlug, id: classIdString } = await params;
  const schoolId = await resolveSchoolId(schoolSlug);
  const classId = Number(classIdString);

  const body = await req.json();
  const parsed = classSchema
    .extend({
      gradeId: z.coerce.number(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { section, gradeId, supervisorId } = parsed.data;

  const grade = await prisma.grade.findFirst({
    where: { id: gradeId, schoolId },
  });

  if (!grade) {
    return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
  }

  const name = `${grade.level} - ${section}`;

  await prisma.class.update({
    where: { id: classId },
    data: { section, gradeId, supervisorId, name },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  const { schoolId: schoolSlug, id: classIdString } = await params;
  const schoolId = await resolveSchoolId(schoolSlug);
  const classId = Number(classIdString);

  const cls = await prisma.class.findFirst({
    where: { id: classId, schoolId },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const studentCount = await prisma.student.count({
    where: { classId, schoolId },
  });

  if (studentCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete class with students" },
      { status: 400 },
    );
  }

  await prisma.class.delete({ where: { id: classId } });

  return NextResponse.json({ message: "Class deleted successfully" });
}
