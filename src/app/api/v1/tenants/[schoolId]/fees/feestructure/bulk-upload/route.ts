export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
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

    /* ---------------- Fetch reference data ---------------- */

    const [grades, academicYears, feeCycles] = await Promise.all([
      prisma.grade.findMany({
        where: { schoolId },
        select: { id: true },
      }),

      prisma.academicYear.findMany({
        where: { schoolId },
        select: { id: true, name: true },
      }),

      prisma.feeCycle.findMany({
        where: { schoolId },
        select: { id: true, name: true, academicYearId: true },
      }),
    ]);

    const gradeSet = new Set(grades.map((g) => g.id));

    const academicYearMap = new Map(
      academicYears.map((y) => [y.name, y.id])
    );

    const feeCycleMap = new Map(
      feeCycles.map((c) => [
        `${c.name}_${c.academicYearId}`,
        c.id,
      ])
    );

    /* ---------------- Validation ---------------- */

    for (let i = 0; i < feeStructures.length; i++) {
      const row = feeStructures[i];
      const rowNo = i + 2;

      if (
        !row.gradeId ||
        !row.feeCycle ||
        !row.feeType ||
        !row.amount ||
        !row.academicYear
      ) {
        errors.push(`Row ${rowNo}: Missing required fields`);
        continue;
      }

      const gradeId = Number(row.gradeId);
      if (!gradeSet.has(gradeId)) {
        errors.push(`Row ${rowNo}: Invalid grade`);
        continue;
      }

      const academicYearId = academicYearMap.get(row.academicYear);
      if (!academicYearId) {
        errors.push(`Row ${rowNo}: Invalid academic year`);
        continue;
      }

      const feeCycleId = feeCycleMap.get(
        `${row.feeCycle}_${academicYearId}`
      );

      if (!feeCycleId) {
        errors.push(`Row ${rowNo}: Invalid fee cycle`);
        continue;
      }

      validRecords.push({
        gradeId,
        feeCycleId,
        feeType: row.feeType,
        amount: Number(row.amount),
        academicYearId,
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
            gradeId_feeCycleId_feeType_academicYearId_schoolId: {
              gradeId: record.gradeId,
              feeCycleId: record.feeCycleId,
              feeType: record.feeType,
              academicYearId: record.academicYearId,
              schoolId,
            },
          },
          update: {
            amount: record.amount,
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