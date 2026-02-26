export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { AcademicYear } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* ---------- Auth ---------- */
    const user = await fetchUserInfo(schoolId);

    if (!user.userId || !user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "student" || !user.studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const academicYearParam = searchParams.get("academicYear");

    if (!academicYearParam) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 },
      );
    }

    if (
      !Object.values(AcademicYear).includes(academicYearParam as AcademicYear)
    ) {
      return NextResponse.json(
        { error: "Invalid academicYear" },
        { status: 400 },
      );
    }

    const academicYear = academicYearParam as AcademicYear;

    /* ---------- Fetch Student Fees ---------- */
    const fees = await prisma.studentFees.findMany({
      where: {
        studentId: user.studentId,
        academicYear,
        schoolId,
      },
      include: {
        feeStructure: true,
      },
      orderBy: { term: "asc" },
    });

    if (!fees.length) {
      return NextResponse.json({
        totalExpected: 0,
        totalPaid: 0,
        totalDiscount: 0,
        totalFine: 0,
        totalDue: 0,
        isFullyPaid: true,
        breakdown: [],
      });
    }

    /* ---------- Calculate Totals ---------- */
    let totalExpected = 0;
    let totalPaid = 0;
    let totalDiscount = 0;
    let totalFine = 0;

    const breakdown = fees.map((f) => {
      const expected =
        (f.feeStructure.termFees || 0) + (f.feeStructure.abacusFees || 0);

      const paid = f.paidAmount || 0;
      const discount = f.discountAmount || 0;
      const fine = f.fineAmount || 0;

      const due = expected - (paid + discount);

      totalExpected += expected;
      totalPaid += paid;
      totalDiscount += discount;
      totalFine += fine;

      return {
        term: f.term,
        expected,
        paid,
        discount,
        fine,
        due: due < 0 ? 0 : due,
      };
    });

    const totalDue = totalExpected - (totalPaid + totalDiscount);

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
