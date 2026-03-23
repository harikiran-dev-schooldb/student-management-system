import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  const { schoolId: schoolSlug, id } = await params;
  const schoolId = await resolveSchoolId(schoolSlug);
  const db = tenantPrisma(schoolId);
  console.log("DELETE schoolId:", schoolId);

  const examGradeSubjectId = Number(id);

  // 🔥 Step 1: Get examId BEFORE delete
  const existing = await db.examGradeSubject.findUnique({
    where: { id: examGradeSubjectId },
    select: { examId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const examId = existing.examId;

  // 🔥 Step 2: Delete subject row
  await db.examGradeSubject.delete({
    where: { id: examGradeSubjectId, schoolId },
  });

  // 🔥 Step 3: Check remaining subjects
  const remaining = await db.examGradeSubject.count({
    where: { examId, schoolId },
  });

  // 🔥 Step 4: Delete exam if empty
  if (remaining === 0) {
    await db.exam.delete({
      where: { id: examId, schoolId },
    });
  }

  return NextResponse.json({ success: true });
}