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

    const { transactionId, reason } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
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

      // Mark transaction cancelled
      await tx.feeTransaction.update({
        where: { id: txn.id },
        data: {
          deletedAt: new Date(),
          transactionType: "CANCELLED",
        },
      });

      // Fetch student fee with structure
      const studentFee = await tx.studentFees.findUnique({
        where: { id: txn.studentFeesId },
        include: { feeStructure: true },
      });

      if (!studentFee) {
        throw new Error("Student fee record not found");
      }

      // Reverse StudentFees safely
      const updatedFee = await tx.studentFees.update({
        where: { id: txn.studentFeesId },
        data: {
          paidAmount: { decrement: txn.amount },
          discountAmount: { decrement: txn.discountAmount },
          fineAmount: { decrement: txn.fineAmount },
        },
      });

      // Recalculate due
      const assigned = getAssignedFee(studentFee);

      const newDue = calculateDueAmount({
        ...studentFee,
        paidAmount: studentFee.paidAmount - txn.amount,
        discountAmount: studentFee.discountAmount - txn.discountAmount,
        fineAmount: studentFee.fineAmount - txn.fineAmount,
      });

      // Reverse totals
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
          dueAmount: newDue,
          status:
            newDue === 0
              ? "Paid"
              : newDue < assigned
              ? "Partially Paid"
              : "Not Paid",
        },
      });

      // Log cancelled receipt
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
