import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { resolveSchoolId } from "@/lib/resolveSchool";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,       // ✅ NO NEXT_PUBLIC
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/* ======================================================
   POST → Create Razorpay Order (Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

    const body = await req.json();
    const { amount } = body;

    /* ---------------------------
       Validate Amount
    ---------------------------- */
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // ₹ to paise
      currency: "INR",
      receipt: `receipt_${schoolId}_${Date.now()}`,
      notes: {
        schoolId,
      },
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