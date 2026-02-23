import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

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
  try {
    const { schoolId: schoolSlug, id: classIdString } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const classId = Number(classIdString);

    if (Number.isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const body = await req.json();
    const { supervisorId } = body;

    if (!supervisorId) {
      return NextResponse.json(
        { error: "Supervisor ID is required" },
        { status: 400 },
      );
    }

    // 🔹 Get existing class with grade
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId,
      },
      include: {
        Grade: true,
      },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // 🔹 Regenerate name from grade + section
    const name = `${existingClass.Grade.level} - ${existingClass.section}`;

    const updated = await prisma.class.updateMany({
      where: {
        id: classId,
        schoolId,
      },
      data: {
        supervisorId,
        name,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update supervisor error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
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
