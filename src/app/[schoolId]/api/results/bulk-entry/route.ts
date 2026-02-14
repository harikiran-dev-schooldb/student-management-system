import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const { gradeId, examId, entries } = await request.json();

    /* -------------------------
       1️⃣ Basic Validation
    -------------------------- */
    if (!gradeId || !examId || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* -------------------------
       2️⃣ Fetch Subjects (Tenant Safe)
    -------------------------- */
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        grades: { some: { id: gradeId } },
      },
    });

    const subjectMap = subjects.reduce((acc, subj) => {
      acc[subj.name] = subj.id;
      return acc;
    }, {} as Record<string, number>);

    const transactionOperations = [];

    /* -------------------------
       3️⃣ Prepare Upserts
    -------------------------- */
    for (const entry of entries) {
      const { studentId, marks } = entry;

      for (const [subjectName, markValue] of Object.entries(marks)) {
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

        const op = prisma.result.upsert({
          where: {
            studentId_examId_subjectId_schoolId: {
              studentId,
              examId,
              subjectId,
              schoolId, // ✅ REQUIRED
            },
          },
          update: {
            marks: numericMark,
          },
          create: {
            studentId,
            examId,
            subjectId,
            marks: numericMark,
            schoolId, // ✅ REQUIRED
          },
        });

        transactionOperations.push(op);
      }
    }

    /* -------------------------
       4️⃣ Execute Transaction
    -------------------------- */
    if (transactionOperations.length > 0) {
      await prisma.$transaction(transactionOperations);
    }

    return NextResponse.json({
      message: "Results saved successfully",
      count: transactionOperations.length,
    });
  } catch (error) {
    console.error("Bulk Entry Error:", error);
    return NextResponse.json(
      { error: "Failed to save results. Check server console." },
      { status: 500 }
    );
  }
}
