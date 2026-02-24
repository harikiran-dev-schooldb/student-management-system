import { resolveSchoolId } from "@/lib/resolveSchool";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId: schoolSlug } = await params;
  const resolvedSchoolId = await resolveSchoolId(schoolSlug);

  const body = await req.json();

  const assignment = await prisma.assignment.create({
    data: {
      title: body.title,
      description: body.description,
      schoolId: resolvedSchoolId,
      assignmentGradeSubjects: {
        create: {
          gradeId: body.gradeId,
          classId: body.classId,
          subjectId: body.subjectId,
          dueDate: new Date(body.dueDate),
          maxMarks: body.maxMarks,
          schoolId: resolvedSchoolId,
        },
      },
    },
  });

  return NextResponse.json({ success: true, assignment });
}
