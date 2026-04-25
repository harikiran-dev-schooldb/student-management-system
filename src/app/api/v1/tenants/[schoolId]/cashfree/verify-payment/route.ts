import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ status: "missing" });
    }

    const base =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const res = await fetch(`${base}/orders/${orderId}`, {
      headers: {
        "x-api-version": "2025-01-01",
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      },
    });

    const data = await res.json();

    return NextResponse.json({
      order_status: data.order_status,
      payment_status:
        data?.payments?.[0]?.payment_status || "UNKNOWN",
    });
  } catch (err) {
    console.error("❌ Verify error:", err);
    return NextResponse.json({ status: "error" });
  }
}