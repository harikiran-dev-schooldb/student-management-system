import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string;}> },
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

    const { transactionId, reason } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      /* 1️⃣ Fetch original transaction */
      const txn = await tx.feeTransaction.findFirst({
        where: {
          id: transactionId,
          schoolId,
          deletedAt: null,
        },
      });

      if (!txn) {
        throw new Error("Transaction not found or already cancelled");
      }

      /* 2️⃣ Mark original as cancelled */
      await tx.feeTransaction.update({
        where: { id: txn.id },
        data: {
          deletedAt: new Date(),
          transactionType: "CANCELLED",
        },
      });

      /* 3️⃣ Reverse StudentFees */
      await tx.studentFees.update({
        where: { id: txn.studentFeesId },
        data: {
          paidAmount: { decrement: txn.amount },
          discountAmount: { decrement: txn.discountAmount },
          fineAmount: { decrement: txn.fineAmount },
        },
      });

      /* 4️⃣ Reverse StudentTotalFees */
      await tx.studentTotalFees.update({
        where: {
          studentId_schoolId: {
            studentId: txn.studentId,
            schoolId,
          },
        },
        data: {
          totalPaidAmount: { decrement: txn.amount },
          totalDiscountAmount: { decrement: txn.discountAmount },
          totalFineAmount: { decrement: txn.fineAmount },
          totalFeeAmount: {
            decrement: txn.amount + txn.discountAmount + txn.fineAmount,
          },
        },
      });

      /* 5️⃣ Log Cancelled Receipt */
      await tx.cancelledReceipt.create({
        data: {
          studentId: txn.studentId,
          term: txn.term,
          originalReceiptNo: txn.receiptNo,
          cancelledAmount: txn.amount,
          cancelledDiscount: txn.discountAmount,
          cancelledFine: txn.fineAmount,
          cancelledTotal: txn.amount + txn.discountAmount + txn.fineAmount,
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
