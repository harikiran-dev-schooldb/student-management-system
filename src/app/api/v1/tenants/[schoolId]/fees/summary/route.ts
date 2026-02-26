export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string;}> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

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
      where.academicYear = academicYear;
    }

    /* ================================
       1️⃣ Payment Mode Summary
    ================================= */
    const paymentMode = await prisma.feeTransaction.groupBy({
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
    const termWise = await prisma.feeTransaction.groupBy({
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
    const rawTransactions = await prisma.feeTransaction.findMany({
      where,
      select: {
        studentId: true,
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

    const studentIds = [...new Set(rawTransactions.map((r) => r.studentId))];

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
      select: {
        id: true,
        Class: {
          select: { name: true },
        },
      },
    });

    const classMap = new Map(
      students.map((s) => [s.id, s.Class?.name ?? "Unknown"]),
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

      classWiseMap[className].collected += txn.amount ?? 0;
      classWiseMap[className].discount += txn.discountAmount ?? 0;
      classWiseMap[className].fine += txn.fineAmount ?? 0;
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
