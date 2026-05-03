export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const user = await fetchUserInfo(schoolSlug);

    if (!user?.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can cancel transactions" },
        { status: 403 }
      );
    }

    const { studentFeesId, reason } = await req.json();

    if (!studentFeesId) {
      return NextResponse.json(
        { error: "studentFeesId is required" },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      /* =========================
         1️⃣ Fetch transactions
      ========================= */

      const transactions = await tx.feeTransaction.findMany({
        where: {
          studentFeesId,
          schoolId,
          deletedAt: null,
          transactionType: "PAYMENT",
        },
      });

      if (!transactions.length) {
        throw new Error("No active transactions found");
      }

      /* =========================
         2️⃣ Soft delete transactions
      ========================= */

      await tx.feeTransaction.updateMany({
        where: {
          studentFeesId,
          schoolId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          transactionType: "CANCELLED",
        },
      });

      /* =========================
         3️⃣ Calculate totals
      ========================= */

      const totalPaid = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const totalDiscount = transactions.reduce(
        (sum, t) => sum + Number(t.discountAmount),
        0
      );

      const totalFine = transactions.reduce(
        (sum, t) => sum + Number(t.fineAmount),
        0
      );

      /* =========================
         4️⃣ Fetch student fee
      ========================= */

      const studentFee = await tx.studentFees.findUnique({
        where: { id: studentFeesId },
        include: {
          feeStructure: true,
        },
      });

      if (!studentFee) {
        throw new Error("Student fee not found");
      }

      const expected = studentFee.feeStructure?.amount ?? 0;

      /* =========================
         5️⃣ Reset studentFees
      ========================= */

      await tx.studentFees.update({
        where: { id: studentFeesId },
        data: {
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          dueAmount: expected, // 🔥 full reset
          receiptNo: null,
          remarks: "Payment cancelled",
        },
      });

      /* =========================
         6️⃣ Update totals
      ========================= */

      await tx.studentTotalFees.update({
        where: {
          studentId_academicYearId_schoolId: {
            studentId: studentFee.studentId,
            schoolId,
            academicYearId: studentFee.academicYearId,
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
          dueAmount: {
            increment: totalPaid - totalDiscount + totalFine, // ✅ correct math
          },
        },
      });

      /* =========================
         7️⃣ Log cancellation
      ========================= */

      await tx.cancelledReceipt.create({
  data: {
    studentId: studentFee.studentId,
    feeCycleId: studentFee.feeCycleId,
    academicYearId: studentFee.academicYearId, // ✅ ADD THIS
    originalReceiptNo: transactions[0]?.receiptNo ?? "",
    cancelledAmount: totalPaid,
    cancelledDiscount: totalDiscount,
    cancelledFine: totalFine,
    cancelledTotal: totalPaid + totalDiscount + totalFine,
    cancelledBy: user.userId ?? null, // ✅ fix undefined issue
    reason: reason ?? null, // ✅ avoid any
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
      { status: 400 }
    );
  }
}