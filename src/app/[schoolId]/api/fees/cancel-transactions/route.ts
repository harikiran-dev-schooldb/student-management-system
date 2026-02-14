import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { studentId, term, cancelledBy, reason } = await req.json();

    if (!studentId || !term) {
      return NextResponse.json(
        { message: "studentId and term are required." },
        { status: 400 }
      );
    }

    /* ─────────────────────────────
       1️⃣ Aggregate existing payments (Tenant Safe)
    ───────────────────────────── */
    const aggregates = await prisma.feeTransaction.aggregate({
      where: {
        studentId,
        term,
        schoolId, // ✅ tenant filter
      },
      _sum: {
        amount: true,
        discountAmount: true,
        fineAmount: true,
      },
    });

    const totalPaidAmount = aggregates._sum.amount ?? 0;
    const totalDiscountAmount = aggregates._sum.discountAmount ?? 0;
    const totalFineAmount = aggregates._sum.fineAmount ?? 0;
    const totalFeeAmount =
      totalPaidAmount + totalDiscountAmount + totalFineAmount;

    /* ─────────────────────────────
       2️⃣ Get receipt number (Tenant Safe)
    ───────────────────────────── */
    const studentFee = await prisma.studentFees.findFirst({
      where: {
        studentId,
        term,
        schoolId, // ✅ tenant filter
      },
      select: { receiptNo: true },
    });

    const receiptNo = studentFee?.receiptNo ?? "N/A";

    /* ─────────────────────────────
       3️⃣ Transaction
    ───────────────────────────── */
    await prisma.$transaction(async (tx) => {
      // 3.1 Delete fee transactions
      await tx.feeTransaction.deleteMany({
        where: {
          studentId,
          term,
          schoolId, // ✅ tenant filter
        },
      });

      // 3.2 Reset studentFees
      await tx.studentFees.updateMany({
        where: {
          studentId,
          term,
          schoolId, // ✅ tenant filter
        },
        data: {
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          receiptDate: null,
          receiptNo: null,
          remarks: null,
        },
      });

      // 3.3 Update StudentTotalFees (Composite Unique)
      if (totalFeeAmount > 0) {
        const studentTotal = await tx.studentTotalFees.findUnique({
          where: {
            studentId_schoolId: {
              studentId,
              schoolId,
            },
          },
          select: {
            totalPaidAmount: true,
            totalDiscountAmount: true,
            totalFineAmount: true,
            totalFeeAmount: true,
          },
        });

        if (studentTotal) {
          await tx.studentTotalFees.update({
            where: {
              studentId_schoolId: {
                studentId,
                schoolId,
              },
            },
            data: {
              totalPaidAmount: Math.max(
                0,
                studentTotal.totalPaidAmount - totalPaidAmount
              ),
              totalDiscountAmount: Math.max(
                0,
                studentTotal.totalDiscountAmount - totalDiscountAmount
              ),
              totalFineAmount: Math.max(
                0,
                studentTotal.totalFineAmount - totalFineAmount
              ),
              totalFeeAmount: Math.max(
                0,
                studentTotal.totalFeeAmount - totalFeeAmount
              ),
            },
          });
        }
      }

      // 3.4 Log Cancelled Receipt
      if (totalFeeAmount > 0) {
        await tx.cancelledReceipt.create({
          data: {
            studentId,
            term,
            originalReceiptNo: receiptNo,
            cancelledAmount: totalPaidAmount,
            cancelledDiscount: totalDiscountAmount,
            cancelledFine: totalFineAmount,
            cancelledTotal: totalFeeAmount,
            cancelledBy,
            reason,
            schoolId, // ✅ REQUIRED
          },
        });
      }
    });

    return NextResponse.json({
      message: "Fee transactions cancelled successfully.",
    });
  } catch (error: any) {
    console.error("❌ Cancel Fee Error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
