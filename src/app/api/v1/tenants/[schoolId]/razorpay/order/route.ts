import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -------------------------------
       1️⃣ Initialize Razorpay INSIDE handler
    -------------------------------- */
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    /* -------------------------------
       2️⃣ Resolve Tenant
    -------------------------------- */
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const body = await req.json();
    const { amount } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${slug}_${Date.now()}`,
      notes: { schoolId },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}