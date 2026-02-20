import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { AcademicYear } from "@prisma/client";

export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

    const { searchParams } = new URL(req.url);
    const academicYearParam = searchParams.get("academicYear");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    /* ---------------- Date Range ---------------- */

    const today = new Date();

    const from = fromParam
      ? new Date(fromParam)
      : new Date(today.setDate(today.getDate() - 30));

    const to = toParam ? new Date(toParam) : new Date();

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    /* ---------------- Where Clause ---------------- */

    const where: any = {
      schoolId,
      transactionType: "PAYMENT",
      deletedAt: null,
      receiptDate: {
        gte: from,
        lte: to,
      },
    };

    if (
      academicYearParam &&
      Object.values(AcademicYear).includes(
        academicYearParam as AcademicYear
      )
    ) {
      where.academicYear = academicYearParam;
    }

    /* ---------------- Fetch Transactions ---------------- */

    const transactions = await prisma.feeTransaction.findMany({
      where,
      select: {
        receiptDate: true,
        amount: true,
      },
      orderBy: { receiptDate: "asc" },
    });

    /* ---------------- Aggregate By Date ---------------- */

    const dailyMap: Record<string, number> = {};

    for (const txn of transactions) {
      const dateKey = txn.receiptDate
        .toISOString()
        .split("T")[0];

      dailyMap[dateKey] =
        (dailyMap[dateKey] || 0) + (txn.amount || 0);
    }

    const summary = Object.entries(dailyMap).map(
      ([date, collected]) => ({
        date,
        collected,
      })
    );

    return NextResponse.json(summary);

  } catch (error) {
    console.error("Daily summary error:", error);

    return NextResponse.json(
      { error: "Failed to fetch daily summary" },
      { status: 500 }
    );
  }
}
