export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId: schoolSlug } = await params;
  const { access, error } = await tenantSlugGuard(schoolSlug);

  if (error) return error;

  if (!["admin", "teacher"].includes(access.role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const schoolId = access.schoolId;

  const body = await req.json();

  const assignment = await prisma.assignment.create({
    data: {
      title: body.title,
      description: body.description,
      schoolId,
      assignmentGradeSubjects: {
        create: {
          gradeId: body.gradeId,
          classId: body.classId,
          subjectId: body.subjectId,
          dueDate: new Date(body.dueDate),
          maxMarks: body.maxMarks,
          schoolId,
        },
      },
    },
  });

  return NextResponse.json({ success: true, assignment });
}
