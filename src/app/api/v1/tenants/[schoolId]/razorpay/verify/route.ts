export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

/* ======================================================
   POST → Verify Razorpay Payment (Tenant Safe + Atomic)
====================================================== */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug} = await params
    const schoolId = await resolveSchoolId(schoolSlug);

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!orderCreationId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    /* 1️⃣ Verify signature */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderCreationId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.findUnique({
        where: { orderId: orderCreationId },
      });

      if (!payment) throw new Error("Payment record not found");

      if (payment.status === "SUCCESS") return payment;

      /* 2️⃣ Validate Razorpay amount */
      const razorpayOrder = await razorpay.orders.fetch(orderCreationId);

      if (razorpayOrder.amount !== payment.amount * 100) {
        throw new Error("Amount mismatch detected");
      }

      /* 3️⃣ Mark SUCCESS */
      const updatedPayment = await tx.feePayment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          transactionId: razorpayPaymentId,
        },
      });

      /* 4️⃣ Extract metadata */
      const metadata = payment.metadata as any;
      const terms = metadata?.terms || [];
      const academicYear = metadata?.academicYear;

      for (const term of terms) {
        const studentFee = await tx.studentFees.findFirst({
          where: {
            studentId: payment.studentId,
            term,
            academicYear,
            schoolId,
          },
        });

        if (!studentFee) continue;

        const dueAmount =
          studentFee.paidAmount +
          studentFee.discountAmount +
          studentFee.fineAmount;

        /* Update StudentFees */
        await tx.studentFees.update({
          where: { id: studentFee.id },
          data: {
            paidAmount: dueAmount,
            paymentMode: "ONLINE",
            receiptNo: `ONL-${razorpayPaymentId.slice(-6)}`,
            receiptDate: new Date(),
          },
        });

        /* Insert FeeTransaction */
        await tx.feeTransaction.create({
          data: {
            studentId: payment.studentId,
            studentFeesId: studentFee.id,
            term,
            amount: dueAmount,
            receiptDate: new Date(),
            receiptNo: `ONL-${razorpayPaymentId.slice(-6)}`,
            paymentMode: "ONLINE",
            academicYear,
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
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}