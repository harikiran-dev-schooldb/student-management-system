export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { Term } from "@prisma/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!orderCreationId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ==============================
       Verify Razorpay Signature
    ============================== */

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderCreationId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    /* ==============================
       Atomic DB Transaction
    ============================== */

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.findUnique({
        where: { orderId: orderCreationId },
      });

      if (!payment) throw new Error("Payment record not found");

      /* Prevent duplicate settlement */
      if (payment.status === "SUCCESS") {
        return payment;
      }

      /* Validate Razorpay order */
      const razorpayOrder = await razorpay.orders.fetch(orderCreationId);

      if (razorpayOrder.amount !== Number(payment.amount) * 100) {
        throw new Error("Amount mismatch detected");
      }

      /* Mark payment SUCCESS */
      const updatedPayment = await tx.feePayment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          transactionId: razorpayPaymentId,
        },
      });

      /* Extract metadata safely */
      const metadata = payment.metadata as any;

      if (!metadata?.terms || !metadata?.academicYear) {
        throw new Error("Invalid payment metadata");
      }

      const terms: Term[] = metadata.terms;
      const academicYearId = metadata.academicYear;

      for (const term of terms) {
        const studentFee = await tx.studentFees.findFirst({
          where: {
            studentId: payment.studentId,
            term,
            academicYearId,
            schoolId,
          },
          include: { feeStructure: true },
        });

        if (!studentFee) continue;

        const assignedFee =
          (studentFee.feeStructure.termFees || 0) +
          (studentFee.feeStructure.abacusFees || 0);

        const due =
          assignedFee -
          studentFee.paidAmount -
          studentFee.discountAmount +
          studentFee.fineAmount;

        if (due <= 0) continue;

        /* Update StudentFees */
        await tx.studentFees.update({
          where: { id: studentFee.id },
          data: {
            paidAmount: { increment: due },
            paymentMode: "ONLINE",
            receiptDate: new Date(),
            receiptNo: `ONL-${razorpayPaymentId.slice(-6)}`,
          },
        });

        /* Create FeeTransaction */
        await tx.feeTransaction.create({
          data: {
            studentId: payment.studentId,
            studentFeesId: studentFee.id,
            term: term,
            academicYearId,
            amount: due,
            receiptDate: new Date(),
            receiptNo: `ONL-${razorpayPaymentId.slice(-6)}`,
            paymentMode: "ONLINE",
            schoolId,
          },
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and settled",
      payment: result,
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}