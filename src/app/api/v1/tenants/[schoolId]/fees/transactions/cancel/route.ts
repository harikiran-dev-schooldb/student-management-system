export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const db = tenantPrisma(schoolId);

    const user = await fetchUserInfo(schoolSlug);

    if (!user?.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can cancel transactions" },
        { status: 403 },
      );
    }

    const { studentId, academicYearId, term, reason } = await req.json();

    if (!studentId || !academicYearId || !term) {
      return NextResponse.json(
        { error: "studentId, academicYearId and term are required" },
        { status: 400 },
      );
    }

    await db.$transaction(async (tx) => {

      /* 1️⃣ Fetch active transactions */

      const transactions = await tx.feeTransaction.findMany({
        where: {
          studentId,
          academicYearId,
          term,
          schoolId,
          deletedAt: null,
          transactionType: "PAYMENT",
        },
      });

      if (!transactions.length) {
        throw new Error("No active transactions found for this term");
      }

      /* 2️⃣ Soft cancel transactions */

      await tx.feeTransaction.updateMany({
        where: {
          studentId,
          academicYearId,
          term,
          schoolId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          transactionType: "CANCELLED",
        },
      });

      /* 3️⃣ Calculate totals */

      const totalPaid = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );

      const totalDiscount = transactions.reduce(
        (sum, t) => sum + Number(t.discountAmount),
        0,
      );

      const totalFine = transactions.reduce(
        (sum, t) => sum + Number(t.fineAmount),
        0,
      );

      /* 4️⃣ Reset studentFees */

      await tx.studentFees.update({
        where: {
          studentId_academicYear_term: {
            studentId,
            academicYearId,
            term,
            schoolId,
          },
        },
        data: {
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          receiptNo: null,
          remarks: "Term payment cancelled",
        },
      });

      /* 5️⃣ Update StudentTotalFees */

      const totalRecord = await tx.studentTotalFees.findUnique({
        where: {
          studentId_academicYearId_schoolId: {
            studentId,
            schoolId,
            academicYearId,
          },
        },
      });

      if (totalRecord) {
        await tx.studentTotalFees.update({
          where: {
            studentId_academicYearId_schoolId: {
              studentId,
              schoolId,
              academicYearId,
            },
          },
          data: {
            totalPaidAmount: {
              decrement: totalPaid,
            },
            totalDiscountAmount: {
              decrement: totalDiscount,
            },
            totalFineAmount: {
              decrement: totalFine,
            },
          },
        });
      }

      /* 6️⃣ Log cancellation */

      await tx.cancelledReceipt.create({
        data: {
          studentId,
          term,
          originalReceiptNo: transactions[0]?.receiptNo ?? null,
          cancelledAmount: totalPaid,
          cancelledDiscount: totalDiscount,
          cancelledFine: totalFine,
          cancelledTotal: totalPaid + totalDiscount + totalFine,
          cancelledBy: user.userId,
          reason,
          schoolId,
        },
      });

    });

    return NextResponse.json({
      message: "Transaction cancelled successfully",
    });

  } catch (error: any) {
    console.error("Cancel transaction error:", error);

    return NextResponse.json(
      { error: error.message || "Cancel failed" },
      { status: 400 },
    );
  }
}