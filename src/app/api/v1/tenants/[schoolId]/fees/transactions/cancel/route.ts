export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { calculateDueAmount, getAssignedFee } from "@/lib/fees/fees";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);

    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can cancel transactions" },
        { status: 403 },
      );
    }

    const { studentId, academicYear, term, reason } = await req.json();

    if (!studentId || !academicYear || !term) {
      return NextResponse.json(
        { error: "studentId, academicYear, term required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Get all active transactions for this term
      const transactions = await tx.feeTransaction.findMany({
        where: {
          studentId,
          academicYear,
          term,
          schoolId,
          deletedAt: null,
        },
      });

      if (!transactions.length) {
        throw new Error("No active transactions found for this term");
      }

      // 2️⃣ Soft cancel all transactions
      await tx.feeTransaction.updateMany({
        where: {
          studentId,
          academicYear,
          term,
          schoolId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          transactionType: "CANCELLED",
        },
      });

      // 3️⃣ Calculate total reversal amounts
      const totalPaid = transactions.reduce((s, t) => s + t.amount, 0);
      const totalDiscount = transactions.reduce(
        (s, t) => s + t.discountAmount,
        0,
      );
      const totalFine = transactions.reduce((s, t) => s + t.fineAmount, 0);

      // 4️⃣ Reset studentFees for that term
      await tx.studentFees.update({
        where: {
          studentId_academicYear_term: {
            studentId,
            academicYear,
            term,
            schoolId,
          },
        },
        data: {
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          receiptNo: null,
          remarks: "Term Cancelled",
        },
      });

      // 5️⃣ Update studentTotalFees
      const totalRecord = await tx.studentTotalFees.findUnique({
        where: {
          studentId_schoolId: { studentId, schoolId },
        },
      });

      if (totalRecord) {
        await tx.studentTotalFees.update({
          where: {
            studentId_schoolId: { studentId, schoolId },
          },
          data: {
            totalPaidAmount: { decrement: totalPaid },
            totalDiscountAmount: { decrement: totalDiscount },
            totalFineAmount: { decrement: totalFine },
            dueAmount: totalRecord.dueAmount + totalPaid,
            status: "Not Paid",
          },
        });
      }

      // 6️⃣ Log cancellation entry
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
