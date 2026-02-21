import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

type SubjectRow = {
  name: string;
  gradeIds?: number[];
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------
       1️⃣ Resolve Tenant
    -------------------------------------------------- */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -------------------------------------------------
       2️⃣ Authorize (Admin Only)
    -------------------------------------------------- */
    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* -------------------------------------------------
       3️⃣ Parse Input
    -------------------------------------------------- */
    const { subjects } = await req.json();

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "Invalid subjects array" },
        { status: 400 },
      );
    }

    if (subjects.length > 2000) {
      return NextResponse.json(
        { error: "Upload limit exceeded (max 2000)" },
        { status: 400 },
      );
    }

    const errors: string[] = [];
    let created = 0;
    let skipped = 0;

    /* -------------------------------------------------
       4️⃣ Preload Valid Grades (Tenant Safe)
    -------------------------------------------------- */
    const allGrades = await prisma.grade.findMany({
      where: { schoolId },
      select: { id: true },
    });

    const validGradeSet = new Set(allGrades.map((g) => g.id));

    /* -------------------------------------------------
       5️⃣ Process Rows
    -------------------------------------------------- */
    for (let i = 0; i < subjects.length; i++) {
      const row: SubjectRow = subjects[i];

      if (!row.name || !row.name.trim()) {
        errors.push(`Row ${i + 1}: Missing subject name`);
        skipped++;
        continue;
      }

      const trimmedName = row.name.trim();

      /* ---------- Validate Grades ---------- */
      let validGrades: number[] = [];

      if (Array.isArray(row.gradeIds)) {
        validGrades = row.gradeIds
          .map(Number)
          .filter((id) => validGradeSet.has(id));
      }

      try {
        await prisma.subject.create({
          data: {
            name: trimmedName,
            schoolId,
            grades: validGrades.length
              ? {
                  connect: validGrades.map((id) => ({ id })),
                }
              : undefined,
          },
        });

        created++;
      } catch (err: any) {
        if (err.code === "P2002") {
          errors.push(`Duplicate skipped: ${trimmedName}`);
        } else {
          errors.push(`Failed "${trimmedName}": ${err.message}`);
        }
        skipped++;
      }
    }

    /* -------------------------------------------------
       6️⃣ Response
    -------------------------------------------------- */
    return NextResponse.json(
      {
        message: "Subject upload completed",
        created,
        skipped,
        total: subjects.length,
        errors,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subject Bulk Upload Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
