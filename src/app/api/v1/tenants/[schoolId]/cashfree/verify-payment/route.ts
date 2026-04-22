// /api/verify-payment/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("order_id");

    console.log("🔍 Verifying order:", orderId);

    if (!orderId) {
      return NextResponse.json({ status: "missing" });
    }

    const res = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        },
      }
    );

    const data = await res.json();

    console.log("💰 Cashfree response:", data);

    return NextResponse.json({
      status: data.order_status,
    });

  } catch (err) {
    console.error("❌ Verify API error:", err);
    return NextResponse.json({ status: "error" });
  }
}