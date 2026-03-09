export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);

    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { gradeId, examId, entries } = await request.json();

    if (!gradeId || !examId || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    /* --------------------------------
       Validate Exam
    -------------------------------- */

    const exam = await prisma.exam.findFirst({
      where: { id: Number(examId), schoolId },
      select: { id: true, academicYearId: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const academicYearId = exam.academicYearId;

    /* --------------------------------
       Fetch Subjects
    -------------------------------- */

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        grades: { some: { id: Number(gradeId) } },
      },
      select: { id: true, name: true },
    });

    const subjectMap: Record<string, number> = {};
    for (const s of subjects) subjectMap[s.name] = s.id;

    /* --------------------------------
       Build Bulk Rows
    -------------------------------- */

    const rows: any[] = [];

    for (const entry of entries) {
      for (const [subjectName, markValue] of Object.entries(entry.marks)) {
        const subjectId = subjectMap[subjectName];

        if (!subjectId || markValue === "" || markValue === null) continue;

        rows.push({
          studentId: entry.studentId,
          examId: Number(examId),
          subjectId,
          marks: Number(markValue),
          academicYearId,
          schoolId,
        });
      }
    }

    if (!rows.length) {
      return NextResponse.json({ message: "No results to insert" });
    }

    /* --------------------------------
       Build SQL
    -------------------------------- */

    const values = rows
      .map(
        (r) =>
          `('${r.studentId}', ${r.examId}, ${r.subjectId}, ${r.marks}, '${r.academicYearId}', '${r.schoolId}')`
      )
      .join(",");

    const query = `
      INSERT INTO "Result"
      ("studentId","examId","subjectId","marks","academicYearId","schoolId")
      VALUES ${values}
      ON CONFLICT ("studentId","examId","subjectId","academicYearId","schoolId")
      DO UPDATE SET "marks" = EXCLUDED."marks"
    `;

    await prisma.$executeRawUnsafe(query);

    return NextResponse.json({
      success: true,
      inserted: rows.length,
    });
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Bulk Result Error:", error);

    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}