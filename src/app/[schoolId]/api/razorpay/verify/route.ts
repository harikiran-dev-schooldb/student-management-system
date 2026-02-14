import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params; // ✅ REQUIRED

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
      studentId,
      amount,
    } = await req.json();

    /* -------------------------------
       1️⃣ Verify Razorpay Signature
    -------------------------------- */
    const shasum = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    );

    shasum.update(orderCreationId + "|" + razorpayPaymentId);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return NextResponse.json(
        { message: "Invalid transaction" },
        { status: 400 }
      );
    }

    /* -------------------------------
       2️⃣ Validate Student (Tenant Safe)
    -------------------------------- */
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId, // ✅ CRITICAL
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    /* -------------------------------
       3️⃣ Create FeePayment
    -------------------------------- */
    const payment = await prisma.feePayment.create({
      data: {
        amount: parseFloat(amount),
        studentId,      // FK
        schoolId,       // ✅ REQUIRED
        status: "SUCCESS",
        transactionId: razorpayPaymentId,
        orderId: orderCreationId,
      },
    });

    return NextResponse.json(
      { message: "Payment Verified", success: true, payment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment Verification Failed:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
