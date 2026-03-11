export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { Term } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    console.log("Bulk fee structure upload for school:", schoolId);

    const { feeStructures } = await req.json();

    if (!Array.isArray(feeStructures) || !feeStructures.length) {
      return NextResponse.json(
        { error: "Invalid input array" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const validRecords: any[] = [];

    /* ---------------- Date Parser ---------------- */

    const parseDate = (value: string) => {
      const parts = value.split("-");
      if (parts.length !== 3) return null;

      const [dd, mm, yyyy] = parts;
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);

      return isNaN(parsed.getTime()) ? null : parsed;
    };

    /* ---------------- Fetch reference data once ---------------- */

    const [grades, academicYears] = await Promise.all([
      prisma.grade.findMany({
        where: { schoolId },
        select: { id: true },
      }),

      prisma.academicYear.findMany({
        where: { schoolId },
        select: { id: true, name: true },
      }),
    ]);

    const gradeSet = new Set(grades.map((g) => g.id));

    const academicYearMap = new Map(
      academicYears.map((y) => [y.name, y.id])
    );

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

      if (!Object.values(Term).includes(row.term as Term)) {
        errors.push(`Row ${rowNo}: Invalid term`);
        continue;
      }

      const academicYearId = academicYearMap.get(row.academicYear);

      if (!academicYearId) {
        errors.push(`Row ${rowNo}: Invalid academic year`);
        continue;
      }

      const startDate = parseDate(row.startDate);
      const dueDate = parseDate(row.dueDate);

      if (!startDate || !dueDate) {
        errors.push(`Row ${rowNo}: Invalid date format`);
        continue;
      }

      const gradeId = Number(row.gradeId);

      if (!gradeSet.has(gradeId)) {
        errors.push(`Row ${rowNo}: Invalid grade`);
        continue;
      }

      validRecords.push({
        gradeId,
        term: row.term as Term,
        academicYearId,
        termFees: Number(row.termFees),
        abacusFees: row.abacusFees ? Number(row.abacusFees) : 0,
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
        await tx.feeStructure.upsert({
          where: {
            gradeId_term_academicYearId_schoolId: {
              gradeId: record.gradeId,
              term: record.term,
              academicYearId: record.academicYearId,
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
      inserted: validRecords.length,
      errors,
    });

  } catch (error) {
    console.error("FeeStructure bulk error:", error);

    return NextResponse.json(
      { error: "Bulk upload failed" },
      { status: 500 }
    );
  }
}