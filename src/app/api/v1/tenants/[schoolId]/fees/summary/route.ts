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
      where.academicYearId = academicYear;
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
       2️⃣ Term-wise Summary
    ================================= */

    const termWise = await db.feeTransaction.groupBy({
      by: ["term"],
      where,
      _sum: {
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

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

    return NextResponse.json({
      paymentMode,
      termWise,
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