import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(
  req: NextRequest,
  { params }:  { params: Promise<{ schoolId: string; id: string }> }
) {
  const { schoolId, id: classId } = await params;
  const resolvedSchoolId = await resolveSchoolId(schoolId);
  const classIdNumber = Number(classId);

  const cls = await prisma.class.findFirst({
    where: { id: classIdNumber, schoolId: resolvedSchoolId },
    select: { gradeId: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const subjects = await prisma.subject.findMany({
    where: {
      schoolId: resolvedSchoolId,
      grades: { some: { id: cls.gradeId } },
    },
  });

  return NextResponse.json(subjects);
}
