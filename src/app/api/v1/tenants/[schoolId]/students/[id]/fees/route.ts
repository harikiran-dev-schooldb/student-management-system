export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

/* ======================================================
   GET → Fetch Student Fees (NEW SCHEMA)
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    /* 1️⃣ Resolve Tenant */
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    /* 2️⃣ Auth */
    const user = await fetchUserInfo(schoolSlug);

    if (!user || !user.profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 3️⃣ Student restriction */
    if (user.role === "student" && user.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 4️⃣ Get active enrollment */
    const enrollment = await db.studentEnrollment.findFirst({
      where: {
        studentId,
        schoolId,
        status: "ACTIVE",
      },
      include: {
        class: {
          select: { gradeId: true },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student enrollment not found" },
        { status: 404 }
      );
    }

    const gradeId = enrollment.class.gradeId;
    const academicYearId = enrollment.academicYearId;

    /* ======================================================
       5️⃣ Fetch Fee Structures (NEW MODEL)
    ====================================================== */

    const feeStructures = await db.feeStructure.findMany({
      where: {
        schoolId,
        gradeId,
        academicYearId,
      },
      include: {
        feeCycle: true,
      },
    });

    /* ======================================================
       6️⃣ Fetch Student Fees (ACTUAL STATE)
    ====================================================== */

    const studentFees = await db.studentFees.findMany({
      where: {
        schoolId,
        studentId,
        academicYearId,
      },
      include: {
        feeCycle: true,
        feeStructure: true,
      },
    });

    /* ======================================================
       7️⃣ GROUP STRUCTURES BY FEE CYCLE
    ====================================================== */

    const cycleMap = new Map<
      number,
      {
        feeCycleId: number;
        feeCycleName: string;
        assignedFee: number;
        paidAmount: number;
        discountAmount: number;
        fineAmount: number;
        dueAmount: number;
        paymentMode: string | null;
        receiptDate: Date | null;
      }
    >();

    /* ---- Build assigned fees ---- */

    for (const fs of feeStructures) {
      if (!fs.feeCycleId) continue;

      if (!cycleMap.has(fs.feeCycleId)) {
        cycleMap.set(fs.feeCycleId, {
          feeCycleId: fs.feeCycleId,
          feeCycleName: fs.feeCycle?.name ?? "Unknown",
          assignedFee: 0,
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          dueAmount: 0,
          paymentMode: null,
          receiptDate: null,
        });
      }

      const cycle = cycleMap.get(fs.feeCycleId)!;
      cycle.assignedFee += Number(fs.amount || 0);
    }

    /* ---- Merge student payments ---- */

    for (const sf of studentFees) {
      if (!sf.feeCycleId) continue;

      if (!cycleMap.has(sf.feeCycleId)) continue;

      const cycle = cycleMap.get(sf.feeCycleId)!;

      cycle.paidAmount += Number(sf.paidAmount || 0);
      cycle.discountAmount += Number(sf.discountAmount || 0);
      cycle.fineAmount += Number(sf.fineAmount || 0);

      cycle.dueAmount += Number(sf.dueAmount || 0);

      // latest payment info
      cycle.paymentMode = sf.paymentMode ?? cycle.paymentMode;
      cycle.receiptDate = sf.receiptDate ?? cycle.receiptDate;
    }

    /* ======================================================
       8️⃣ FORMAT RESPONSE
    ====================================================== */

    const result = Array.from(cycleMap.values()).map((cycle) => ({
      feeCycleId: cycle.feeCycleId,
      feeCycleName: cycle.feeCycleName,

      assignedFee: cycle.assignedFee,
      paidAmount: cycle.paidAmount,
      discountAmount: cycle.discountAmount,
      fineAmount: cycle.fineAmount,

      dueAmount: cycle.dueAmount,

      paymentMode: cycle.paymentMode,
      receiptDate: cycle.receiptDate,
    }));

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Student fee API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch student fees" },
      { status: 500 }
    );
  }
}