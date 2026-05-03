export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const academicYear = searchParams.get("academicYear");
    const feeCycleId = searchParams.get("feeCycleId");

    const where: any = {
      schoolId,
      transactionType: "PAYMENT",
      deletedAt: null,
    };

    /* ---------- Date Handling ---------- */

    if (from || to) {
      where.receiptDate = {};

      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          where.receiptDate.gte = fromDate;
        }
      }

      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          where.receiptDate.lte = toDate;
        }
      }
    }

    if (academicYear) {
      where.academicYearId = Number(academicYear);
    }

    if (feeCycleId) {
      where.feeCycleId = Number(feeCycleId);
    }

    /* ================================
       1️⃣ Payment Mode Summary
    ================================= */

    const paymentMode = await db.feeTransaction.groupBy({
      by: ["paymentMode"],
      where,
      _sum: {
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
      _count: { id: true },
    });

    /* ================================
       2️⃣ FeeCycle-wise Summary
    ================================= */

    const cycleWiseRaw = await db.feeTransaction.groupBy({
      by: ["feeCycleId"],
      where,
      _sum: {
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

    // 🔥 handle nulls (migration-safe)
    const cycleIds = cycleWiseRaw
      .map((c) => c.feeCycleId)
      .filter((id): id is number => id !== null);

    const cycles = await db.feeCycle.findMany({
      where: { id: { in: cycleIds } },
      select: { id: true, name: true },
    });

    const cycleMap = Object.fromEntries(
      cycles.map((c) => [c.id, c.name])
    );

    const cycleWise = cycleWiseRaw.map((c) => ({
      feeCycleId: c.feeCycleId,
      name: c.feeCycleId
        ? cycleMap[c.feeCycleId] || "Unknown"
        : "Unassigned",
      amount: Number(c._sum.amount ?? 0),
      discount: Number(c._sum.discountAmount ?? 0),
      fine: Number(c._sum.fineAmount ?? 0),
    }));

    /* ================================
       3️⃣ Class-wise Summary
    ================================= */

    const rawTransactions = await db.feeTransaction.findMany({
      where,
      select: {
        studentId: true,
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

    const studentIds = [...new Set(rawTransactions.map((r) => r.studentId))];

    const students = await db.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
      select: {
        id: true,
        enrollments: {
          select: {
            class: {
              select: {
                id: true,
                name: true,
                section: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    const classMap = new Map(
      students.map((s) => [
        s.id,
        s.enrollments?.[0]?.class?.name ?? "Unknown",
      ]),
    );

    const classWiseMap: Record<
      string,
      { className: string; collected: number; discount: number; fine: number }
    > = {};

    for (const txn of rawTransactions) {
      const className = classMap.get(txn.studentId) ?? "Unknown";

      if (!classWiseMap[className]) {
        classWiseMap[className] = {
          className,
          collected: 0,
          discount: 0,
          fine: 0,
        };
      }

      classWiseMap[className].collected += Number(txn.amount || 0);
      classWiseMap[className].discount += Number(txn.discountAmount || 0);
      classWiseMap[className].fine += Number(txn.fineAmount || 0);
    }

    const classWise = Object.values(classWiseMap);

    /* ================================
       RESPONSE
    ================================= */

    return NextResponse.json({
      paymentMode,
      feeCycleWise: cycleWise,
      classWise,
    });

  } catch (error) {
    console.error("Fees summary error:", error);

    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}