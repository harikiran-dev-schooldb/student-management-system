import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { AcademicYear, Term } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string;}> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { feeStructures } = await req.json();

    if (!Array.isArray(feeStructures) || !feeStructures.length) {
      return NextResponse.json(
        { error: "Invalid input array" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const validRecords: any[] = [];

    const parseDate = (value: string) => {
      const [dd, mm, yyyy] = value.split("-");
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    /* ---------------- Validation ---------------- */

    for (let i = 0; i < feeStructures.length; i++) {
      const row = feeStructures[i];
      const rowNo = i + 2;

      if (
        !row.gradeId ||
        !row.term ||
        !row.termFees ||
        !row.startDate ||
        !row.dueDate ||
        !row.academicYear
      ) {
        errors.push(`Row ${rowNo}: Missing required fields`);
        continue;
      }

      if (
        !Object.values(Term).includes(row.term)
      ) {
        errors.push(`Row ${rowNo}: Invalid term`);
        continue;
      }

      if (
        !Object.values(AcademicYear).includes(
          row.academicYear
        )
      ) {
        errors.push(`Row ${rowNo}: Invalid academicYear`);
        continue;
      }

      const startDate = parseDate(row.startDate);
      const dueDate = parseDate(row.dueDate);

      if (!startDate || !dueDate) {
        errors.push(`Row ${rowNo}: Invalid date format`);
        continue;
      }

      validRecords.push({
        gradeId: Number(row.gradeId),
        term: row.term,
        academicYear: row.academicYear,
        termFees: Number(row.termFees),
        abacusFees: row.abacusFees
          ? Number(row.abacusFees)
          : 0,
        startDate,
        dueDate,
      });
    }

    if (!validRecords.length) {
      return NextResponse.json(
        { error: "No valid records", errors },
        { status: 400 }
      );
    }

    /* ---------------- Transaction ---------------- */

    await prisma.$transaction(async (tx) => {
      for (const record of validRecords) {
        /* Validate grade belongs to school */
        const grade = await tx.grade.findFirst({
          where: {
            id: record.gradeId,
            schoolId,
          },
        });

        if (!grade) {
          errors.push(
            `Grade ${record.gradeId} does not belong to this school`
          );
          continue;
        }

        await tx.feeStructure.upsert({
          where: {
            gradeId_term_academicYear_schoolId: {
              gradeId: record.gradeId,
              term: record.term,
              academicYear: record.academicYear,
              schoolId,
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
            schoolId,
          },
        });
      }
    });

    return NextResponse.json({
      message: "Bulk fee structure upload completed",
      errors,
    });

  } catch (error: any) {
    console.error("FeeStructure bulk error:", error);

    return NextResponse.json(
      { error: "Bulk upload failed" },
      { status: 500 }
    );
  }
}
