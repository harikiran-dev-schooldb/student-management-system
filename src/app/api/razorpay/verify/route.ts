import { NextResponse } from "next/server";
import crypto from "crypto";

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
    await prisma.feePayment.create({
      data: {
        amount: parseFloat(amount),
        studentId: (studentId),
        status: "SUCCESS",
        transactionId: razorpayPaymentId,
        orderId: orderCreationId,
      },
    });

    return NextResponse.json({ message: "Payment Verified", success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}