import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma"; // <--- MISSING IMPORT

export async function POST(req: Request) {
  try {
    const { orderCreationId, razorpayPaymentId, razorpaySignature, studentId, amount } = await req.json();

    // 1. Create the expected signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(orderCreationId + "|" + razorpayPaymentId);
    const digest = shasum.digest("hex");

    // 2. Compare with the signature Razorpay sent
    if (digest !== razorpaySignature) {
      return NextResponse.json({ message: "Invalid transaction" }, { status: 400 });
    }

    // 3. Save to Database (Success)
    // CHECK: Ensure studentId format matches your Schema (Int vs String)
    const payment = await prisma.feePayment.create({
      data: {
        amount: parseFloat(amount),
        studentId: studentId, // If your DB uses Int, wrap this: Number(studentId)
        status: "SUCCESS",
        transactionId: razorpayPaymentId,
        orderId: orderCreationId,
      },
    });

    return NextResponse.json({ message: "Payment Verified", success: true, payment }, { status: 200 });
  } catch (error: any) {
    console.error("Payment Verification Failed:", error);
    // Return the actual error message to help you debug
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}