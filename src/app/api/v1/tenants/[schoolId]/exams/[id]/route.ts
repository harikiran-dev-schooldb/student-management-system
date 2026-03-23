export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

/* ======================================================
   UPDATE EXAM SCHEDULE ENTRY
   (examGradeSubject)
====================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug, id: examIdString } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const db = tenantPrisma(schoolId);
    const examId = Number(examIdString);

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    /* -----------------------------
       2️⃣ Authorize (Admin Only)
    ------------------------------ */
    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* -----------------------------
       3️⃣ Validate Payload
    ------------------------------ */
    const { gradeId, subjectId, examDate, startTime, maxMarks, academicYearId } =
      await req.json();

    if (!gradeId || !subjectId || !examDate || !startTime || !maxMarks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    /* -----------------------------
       4️⃣ Ensure Schedule Exists
    ------------------------------ */
    const existing = await db.examGradeSubject.findUnique({
      where: {
        examId_gradeId_subjectId_academicYearId_schoolId: {
          examId,
          gradeId: Number(gradeId),
          subjectId: Number(subjectId),
          schoolId,
          academicYearId: (academicYearId),
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Exam schedule not found" },
        { status: 404 },
      );
    }

    /* -----------------------------
       5️⃣ Update
    ------------------------------ */
    const updated = await db.examGradeSubject.update({
      where: {
        examId_gradeId_subjectId_academicYearId_schoolId: {
          examId,
          gradeId: Number(gradeId),
          subjectId: Number(subjectId),
          academicYearId: existing.academicYearId,
          schoolId,
        },
      },
      data: {
        date: new Date(examDate),
        startTime,
        maxMarks: Number(maxMarks),
      },
    });

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (error) {
    console.error("Exam schedule update error:", error);

    return NextResponse.json(
      { error: "Failed to update exam schedule" },
      { status: 500 },
    );
  }
}

/* ======================================================
   DELETE EXAM (Admin Only)
====================================================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug, id: examIdString } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const examId = Number(examIdString);
    const db = tenantPrisma(schoolId)

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    /* -----------------------------
       2️⃣ Authorize
    ------------------------------ */
    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* -----------------------------
       3️⃣ Ensure Exam Exists
    ------------------------------ */
    const exam = await db.exam.findFirst({
      where: { id: examId, schoolId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    /* -----------------------------
       4️⃣ Prevent Deletion If Results Exist
    ------------------------------ */
    const resultCount = await db.result.count({
      where: { examId, schoolId },
    });

    if (resultCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete exam with published results" },
        { status: 400 },
      );
    }

    /* -----------------------------
       5️⃣ Transactional Delete
    ------------------------------ */
    await db.$transaction(async (tx) => {
      // remove schedule entries
      await tx.examGradeSubject.deleteMany({
        where: { examId, schoolId },
      });

      // delete exam
      await tx.exam.delete({
        where: { id: examId },
      });
    });

    return NextResponse.json(
      { success: true, message: "Exam deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Exam delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 },
    );
  }
}
