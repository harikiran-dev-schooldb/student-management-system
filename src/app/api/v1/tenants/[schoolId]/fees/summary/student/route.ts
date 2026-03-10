export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* ---------- Auth ---------- */

    const user = await fetchUserInfo(schoolSlug);

    if (!user?.userId || !user?.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "student" || !user.studentId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const academicYearParam = searchParams.get("academicYear");
    const academicYearId = academicYearParam ? Number(academicYearParam) : undefined;

    if (!academicYearId) {

      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 },
      );
    }

    /* ---------- Validate Academic Year ---------- */

    const year = await prisma.academicYear.findFirst({
      where: {
        id: academicYearId,
        schoolId,
      },
    });

    if (!year) {
      return NextResponse.json(
        { error: "Invalid academicYear" },
        { status: 400 },
      );
    }

    /* ---------- Fetch Student Fees Breakdown ---------- */

    const fees = await prisma.studentFees.findMany({
      where: {
        studentId: user.studentId,
        academicYearId: year.id,
        schoolId,
      },
      include: {
        feeStructure: {
          select: {
            term: true,
            termFees: true,
            abacusFees: true,
          },
        },
      },
      orderBy: {
        term: "asc",
      },
    });

    /* ---------- Aggregate Totals (DB Level) ---------- */

    const totals = await prisma.studentFees.aggregate({
      where: {
        studentId: user.studentId,
        academicYearId: year.id,
        schoolId,
      },
      _sum: {
        paidAmount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

    const totalPaid = totals._sum.paidAmount ?? 0;
    const totalDiscount = totals._sum.discountAmount ?? 0;
    const totalFine = totals._sum.fineAmount ?? 0;

    /* ---------- Calculate Expected + Breakdown ---------- */

    let totalExpected = 0;

    const breakdown = fees.map((f) => {
      const expected =
        (f.feeStructure.termFees ?? 0) +
        (f.feeStructure.abacusFees ?? 0);

      const paid = f.paidAmount ?? 0;
      const discount = f.discountAmount ?? 0;
      const fine = f.fineAmount ?? 0;

      const due = expected - (paid + discount) + fine;

      totalExpected += expected;

      return {
        term: f.term,
        expected,
        paid,
        discount,
        fine,
        due: due < 0 ? 0 : due,
      };
    });

    /* ---------- Final Due ---------- */

    const totalDue =
      totalExpected - (totalPaid + totalDiscount) + totalFine;

    return NextResponse.json({
      totalExpected,
      totalPaid,
      totalDiscount,
      totalFine,
      totalDue: totalDue < 0 ? 0 : totalDue,
      isFullyPaid: totalDue <= 0,
      breakdown,
    });

  } catch (error) {
    console.error("Fee summary error:", error);

    return NextResponse.json(
      { error: "Failed to generate fee summary" },
      { status: 500 },
    );
  }
}