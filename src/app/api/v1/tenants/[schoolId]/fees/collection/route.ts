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
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const feeCycleId = searchParams.get("feeCycleId");
    const classId = searchParams.get("classId");
    const paymentMode = searchParams.get("paymentMode");

    const where: any = {
      schoolId,
    };

    /* ---------------- DATE FILTER ---------------- */

    if (from || to) {
      where.receiptDate = {};

      if (from) where.receiptDate.gte = new Date(from);

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.receiptDate.lte = end;
      }
    }

    if (feeCycleId) where.feeCycleId = Number(feeCycleId);
    if (paymentMode) where.paymentMode = paymentMode;

    if (classId) {
      where.student = {
        enrollments: {
          where: { status: "ACTIVE" },
          some: {
            classId: Number(classId),
          },
        },
      };
    }

    /* ---------------- SUMMARY ---------------- */

    const summary = await db.feeTransaction.aggregate({
      where,
      _sum: {
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
      _count: true,
    });

    /* ---------------- FEE CYCLE BREAKDOWN ---------------- */

    const cycleSummary = await db.feeTransaction.groupBy({
      by: ["feeCycleId"],
      where,
      _sum: {
        amount: true,
      },
    });

    /* ---------------- PAYMENT MODE BREAKDOWN ---------------- */

    const paymentModeSummary = await db.feeTransaction.groupBy({
      by: ["paymentMode"],
      where,
      _sum: {
        amount: true,
      },
    });

    /* ---------------- TRANSACTIONS ---------------- */

    const transactions = await db.feeTransaction.findMany({
      where,
      include: {
        feeCycle: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        student: {
          select: {
            id: true,
            admissionNo: true,
            name: true,
            enrollments: {
              where: { status: "ACTIVE" },
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
        },
      },
      orderBy: {
        receiptDate: "desc",
      },
      take: 100,
    });

    /* ---------------- FORMAT ---------------- */

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      receiptNo: t.receiptNo,
      amount: Number(t.amount),
      discountAmount: Number(t.discountAmount ?? 0),
      fineAmount: Number(t.fineAmount ?? 0),

      feeCycle: {
        id: t.feeCycle?.id,
        name: t.feeCycle?.name,
        type: t.feeCycle?.type,
      },

      paymentMode: t.paymentMode,
      receiptDate: t.receiptDate,

      student: {
        id: t.student?.id,
        admissionNo: t.student?.admissionNo,
        name: t.student?.name,
        className:
          t.student?.enrollments?.[0]?.class?.name ?? null,
        section:
          t.student?.enrollments?.[0]?.class?.section ?? null,
      },
    }));

    /* ---------------- RESOLVE CYCLE NAMES ---------------- */

    const cycleIds = cycleSummary
  .map((c) => c.feeCycleId)
  .filter((id): id is number => id !== null);

    const cycles = await db.feeCycle.findMany({
      where: { id: { in: cycleIds } },
      select: { id: true, name: true },
    });

    const cycleMap = Object.fromEntries(
      cycles.map((c) => [c.id, c.name])
    );

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      summary: {
        totalTransactions: summary._count,
        totalCollected: Number(summary._sum.amount ?? 0),
        totalDiscount: Number(summary._sum.discountAmount ?? 0),
        totalFine: Number(summary._sum.fineAmount ?? 0),
      },

      feeCycleSummary: cycleSummary.map((c) => ({
        feeCycleId: c.feeCycleId,
        name: c.feeCycleId ? cycleMap[c.feeCycleId] : "Unassigned",
        amount: Number(c._sum.amount ?? 0),
      })),

      paymentModeSummary: paymentModeSummary.map((p) => ({
        mode: p.paymentMode,
        amount: Number(p._sum.amount ?? 0),
      })),

      transactions: formattedTransactions,
    });

  } catch (error: any) {
    console.error("Fee report error:", error);

    return NextResponse.json(
      { message: error.message || "Report failed" },
      { status: 500 },
    );
  }
}