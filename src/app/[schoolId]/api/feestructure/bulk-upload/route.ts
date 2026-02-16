import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await context.params;

    const { feeStructures } = await req.json();
    const errors: string[] = [];

    const parseDate = (value: string) => {
      const [dd, mm, yyyy] = value.split("-");
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // 🔥 STEP 1: Find school by slug
        const school = await prisma.schoolInfo.findUnique({
          where: { schoolId: slug },
        });
    
        if (!school) {
          return NextResponse.json(
            { message: "School not found" },
            { status: 404 }
          );
        }

    /* -----------------------------------
       Validate Input
    ----------------------------------- */
    const validatedData = feeStructures
      .map((row: any, index: number) => {
        const missing = [];

        if (!row.gradeId) missing.push("gradeId");
        if (!row.termFees) missing.push("termFees");
        if (!row.term) missing.push("term");
        if (!row.startDate) missing.push("startDate");
        if (!row.dueDate) missing.push("dueDate");
        if (!row.academicYear) missing.push("academicYear");

        const startDate = parseDate(row.startDate);
        const dueDate = parseDate(row.dueDate);

        if (!startDate || !dueDate) {
          errors.push(`Row ${index + 2} has invalid date(s)`);
          return null;
        }

        if (missing.length) {
          errors.push(`Row ${index + 2} missing: ${missing.join(", ")}`);
          return null;
        }

        return {
          gradeId: parseInt(row.gradeId),
          abacusFees: row.abacusFees ? parseInt(row.abacusFees) : 0,
          termFees: parseInt(row.termFees),
          term: row.term,
          startDate,
          dueDate,
          academicYear: row.academicYear,
        };
      })
      .filter(Boolean);

    if (!validatedData.length) {
      return NextResponse.json({
        message: "No valid records found",
        errors,
      });
    }

    /* -----------------------------------
       UPSERT (Tenant Safe)
    ----------------------------------- */
    for (const record of validatedData) {
      await prisma.feeStructure.upsert({
        where: {
          gradeId_term_academicYear_schoolId: {
            gradeId: record.gradeId,
            term: record.term,
            academicYear: record.academicYear,
            schoolId: school.id,
          },
        },
        update: {
          startDate: record.startDate,
          dueDate: record.dueDate,
          termFees: record.termFees,
          abacusFees: record.abacusFees,
        },
        create: {
          ...record,
          schoolId: school.id,
        },
      });
    }

    /* -----------------------------------
       Resync ID sequence (Postgres)
    ----------------------------------- */
    await prisma.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"FeeStructure"', 'id'),
        COALESCE((SELECT MAX(id) FROM "FeeStructure"), 0) + 1,
        false
      );
    `);

    return NextResponse.json({
      message: "Fee structure bulk upload completed (created/updated)",
      errors,
    });
  } catch (error: any) {
    console.error("❌ Bulk upload error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
