import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ status: "missing" });
    }

    /* -------------------------------
       1️⃣ Get from DB (SOURCE OF TRUTH)
    -------------------------------- */
    const payment = await prisma.feePayment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return NextResponse.json({ status: "not_found" });
    }

    /* -------------------------------
       2️⃣ Return clean status
    -------------------------------- */
    return NextResponse.json({
      status: payment.status, // SUCCESS | FAILED | PENDING
    });

  } catch (err) {
    console.error("❌ Verify error:", err);
    return NextResponse.json({ status: "error" });
  }
}