import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

/* ======================================================
   POST → Verify Razorpay Payment (Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
      studentId,
    } = await req.json();

    /* -------------------------------
       1️⃣ Validate Required Fields
    -------------------------------- */
    if (
      !orderCreationId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !studentId
    ) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    /* -------------------------------
       2️⃣ Verify Razorpay Signature
    -------------------------------- */
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

    /* -------------------------------
       3️⃣ Prevent Duplicate Success
    -------------------------------- */
    const alreadyPaid = await prisma.feePayment.findFirst({
      where: {
        transactionId: razorpayPaymentId,
        schoolId,
      },
    });

    if (alreadyPaid) {
      return NextResponse.json(
        { success: true, message: "Payment already verified" },
        { status: 200 }
      );
    }

    /* -------------------------------
       4️⃣ Find Existing Pending Order
    -------------------------------- */
    const pendingOrder = await prisma.feePayment.findFirst({
      where: {
        orderId: orderCreationId,
        schoolId,
        status: "PENDING",
      },
    });

    if (!pendingOrder) {
      return NextResponse.json(
        { error: "Order not found or already processed" },
        { status: 400 }
      );
    }

    /* -------------------------------
       5️⃣ Validate Student (Tenant Safe)
    -------------------------------- */
    if (pendingOrder.studentId !== studentId) {
      return NextResponse.json(
        { error: "Student mismatch for this order" },
        { status: 400 }
      );
    }

    /* -------------------------------
       6️⃣ Update Payment to SUCCESS
    -------------------------------- */
    const updatedPayment = await prisma.feePayment.update({
      where: { id: pendingOrder.id },
      data: {
        status: "SUCCESS",
        transactionId: razorpayPaymentId,
        paymentDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        payment: updatedPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}