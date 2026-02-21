import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ======================================================
   POST → Bulk Result Entry (Tenant + Role Safe)
====================================================== */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    /* -------------------------
       1️⃣ Resolve Tenant
    -------------------------- */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -------------------------
       2️⃣ Authorization
    -------------------------- */
    const user = await fetchUserInfo(schoolId);

    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { gradeId, examId, entries } = await request.json();

    /* -------------------------
       3️⃣ Payload Validation
    -------------------------- */
    if (!gradeId || !examId || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    /* -------------------------
       4️⃣ Validate Exam Belongs to School
    -------------------------- */
    const exam = await prisma.exam.findFirst({
      where: { id: Number(examId), schoolId },
      select: { id: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Invalid exam" }, { status: 404 });
    }

    /* -------------------------
       5️⃣ Fetch Subjects (Tenant Safe)
    -------------------------- */
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        grades: { some: { id: Number(gradeId) } },
      },
    });

    const subjectMap = subjects.reduce((acc, subj) => {
      acc[subj.name] = subj.id;
      return acc;
    }, {} as Record<string, number>);

    /* -------------------------
       6️⃣ Validate Students
    -------------------------- */
    const studentIds = entries.map((e: any) => e.studentId);

    const validStudents = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
        Class: { gradeId: Number(gradeId) },
      },
      select: { id: true },
    });

    const validStudentSet = new Set(validStudents.map((s) => s.id));

    /* -------------------------
       7️⃣ Prepare Upserts
    -------------------------- */
    const transactionOperations = [];

    for (const entry of entries) {
      if (!validStudentSet.has(entry.studentId)) continue;

      for (const [subjectName, markValue] of Object.entries(entry.marks)) {
        const subjectId = subjectMap[subjectName];

        if (
          !subjectId ||
          markValue === "" ||
          markValue === null ||
          markValue === undefined
        ) {
          continue;
        }

        const numericMark = Number(markValue);

        transactionOperations.push(
          prisma.result.upsert({
            where: {
              studentId_examId_subjectId_schoolId: {
                studentId: entry.studentId,
                examId: Number(examId),
                subjectId,
                schoolId,
              },
            },
            update: { marks: numericMark },
            create: {
              studentId: entry.studentId,
              examId: Number(examId),
              subjectId,
              marks: numericMark,
              schoolId,
            },
          }),
        );
      }
    }

    /* -------------------------
       8️⃣ Execute Transaction
    -------------------------- */
    if (transactionOperations.length > 0) {
      await prisma.$transaction(transactionOperations);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Results saved successfully",
        count: transactionOperations.length,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Bulk Entry Error:", error);

    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 },
    );
  }
}
