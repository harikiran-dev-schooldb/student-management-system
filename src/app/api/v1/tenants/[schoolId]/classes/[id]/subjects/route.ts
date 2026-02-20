import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string; classId: string } }
) {
  const schoolId = await resolveSchoolId(context.params.schoolId);
  const classId = Number(context.params.classId);

  const cls = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    select: { gradeId: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const subjects = await prisma.subject.findMany({
    where: {
      schoolId,
      grades: { some: { id: cls.gradeId } },
    },
  });

  return NextResponse.json(subjects);
}
