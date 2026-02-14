// src/app/api/fees/bulk/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMode } from "@prisma/client";

function getTotalFees(fee: any) {
  const termFees = fee.feeStructure?.termFees ?? 0;
  const abacusFees = fee.feeStructure?.abacusFees ?? 0;
  return fee.term === "TERM_2" ? termFees + abacusFees : termFees;
}

function calculateDueAmount(fee: any) {
  const totalFees = getTotalFees(fee);
  const paidAmount = fee.paidAmount ?? 0;
  const discountAmount = fee.discountAmount ?? 0;
  const fineAmount = fee.fineAmount ?? 0;
  return totalFees - paidAmount - discountAmount + fineAmount;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { message: "Invalid input array." },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const record of records) {
      const {
        studentId,
        term,
        amount = 0,
        discountAmount = 0,
        fineAmount = 0,
        receiptDate,
        receiptNo,
        remarks,
        paymentMode = PaymentMode.CASH,
      } = record;

      if (!studentId || !term || amount <= 0) {
        results.push({
          studentId,
          status: "error",
          message: "Missing studentId, term or amount",
        });
        continue;
      }

      /* ─────────────────────────────
         1️⃣ Fetch StudentFee (tenant safe)
      ───────────────────────────── */
      const studentFee = await prisma.studentFees.findFirst({
        where: { studentId, term, schoolId },
        include: { feeStructure: true },
      });

      if (!studentFee) {
        results.push({
          studentId,
          status: "error",
          message: "Student fee record not found",
        });
        continue;
      }

      const dueAmount = calculateDueAmount(studentFee);
      const totalIncomingAmount = amount + discountAmount + fineAmount;

      if (totalIncomingAmount > dueAmount) {
        results.push({
          studentId,
          status: "error",
          message: `Overpayment not allowed. Due: ₹${dueAmount}, Attempted: ₹${totalIncomingAmount}`,
        });
        continue;
      }

      /* ─────────────────────────────
         2️⃣ Update StudentFees
      ───────────────────────────── */
      await prisma.studentFees.update({
        where: { id: studentFee.id },
        data: {
          paidAmount: studentFee.paidAmount + amount,
          discountAmount: studentFee.discountAmount + discountAmount,
          fineAmount: studentFee.fineAmount + fineAmount,
          remarks,
          paymentMode,
          ...(receiptDate && { receiptDate: new Date(receiptDate) }),
          ...(receiptNo && { receiptNo: String(receiptNo) }),
        },
      });

      /* ─────────────────────────────
         3️⃣ Upsert StudentTotalFees (FIXED)
      ───────────────────────────── */
      await prisma.studentTotalFees.upsert({
        where: {
          studentId_schoolId: {
            studentId,
            schoolId,
          },
        },
        update: {
          totalPaidAmount: { increment: amount },
          totalDiscountAmount: { increment: discountAmount },
          totalFineAmount: { increment: fineAmount },
          totalFeeAmount: { increment: totalIncomingAmount },
        },
        create: {
          studentId,
          schoolId, // ✅ REQUIRED FIX
          totalPaidAmount: amount,
          totalDiscountAmount: discountAmount,
          totalFineAmount: fineAmount,
          totalFeeAmount: totalIncomingAmount,
          totalAbacusAmount: 0,
        },
      });

      /* ─────────────────────────────
         4️⃣ Create Transaction (tenant safe)
      ───────────────────────────── */
      await prisma.feeTransaction.create({
        data: {
          studentId,
          term,
          studentFeesId: studentFee.id,
          amount,
          discountAmount,
          fineAmount,
          receiptNo: String(receiptNo),
          paymentMode,
          remarks,
          schoolId, // ✅ REQUIRED
          ...(receiptDate && { receiptDate: new Date(receiptDate) }),
        },
      });

      results.push({ studentId, status: "success" });
    }

    return NextResponse.json(
      { message: "Bulk fee update completed.", results },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk Fee API Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: (error as any)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
