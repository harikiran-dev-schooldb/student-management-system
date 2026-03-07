export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);

    const academicYearId = searchParams.get("academicYear");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    /* ---------------- Date Range ---------------- */

    const today = new Date();

    const from = fromParam
      ? new Date(fromParam)
      : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const to = toParam ? new Date(toParam) : new Date();

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    /* ---------------- Base Where ---------------- */

    const where: any = {
      schoolId,
      transactionType: "PAYMENT",
      deletedAt: null,
      receiptDate: {
        gte: from,
        lte: to,
      },
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    /* ---------------- Fetch Transactions ---------------- */

    const transactions = await db.feeTransaction.findMany({
      where,
      select: {
        receiptDate: true,
        amount: true,
      },
      orderBy: {
        receiptDate: "asc",
      },
    });

    /* ---------------- Aggregate By Date ---------------- */

    const dailyMap = new Map<string, number>();

    for (const txn of transactions) {
      const dateKey = txn.receiptDate.toISOString().split("T")[0];

      const prev = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, prev + Number(txn.amount));
    }

    const summary = Array.from(dailyMap.entries()).map(
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