export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -------------------------------
       1️⃣ ENV VALIDATION
    -------------------------------- */
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not set");
    }
    if (!appId || !secretKey) {
      throw new Error("Cashfree API keys missing");
    }

    /* -------------------------------
       2️⃣ Resolve Tenant
    -------------------------------- */
    const slug = (await params).schoolId;
    const schoolId = await resolveSchoolId(slug);

    /* -------------------------------
       3️⃣ Parse Request Body
    -------------------------------- */
    const body = await req.json();
    const { amount, customer_name, customer_phone } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    /* -------------------------------
       4️⃣ Generate Order ID
    -------------------------------- */
    const orderId = `order_${slug}_${Date.now()}`;

    /* -------------------------------
       5️⃣ Create Cashfree Order
    -------------------------------- */
    const response = await fetch(
      "https://sandbox.cashfree.com/pg/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": appId,
          "x-client-secret": secretKey,
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: amount,
          order_currency: "INR",
          customer_details: {
            customer_id: `cust_${Date.now()}`,
            customer_name: customer_name || "Student",
            customer_phone: customer_phone || "9999999999",
          },
          order_meta: {
            return_url: `${baseUrl}/${slug}/payment/success?order_id={order_id}`,
            notify_url: `${baseUrl}/${slug}/api/cashfree/webhook`,
          },
        }),
      }
    );

    const data = await response.json();

    /* -------------------------------
       6️⃣ Handle Cashfree Errors
    -------------------------------- */
    if (!response.ok) {
      console.error("❌ Cashfree error:", data);
      return NextResponse.json(
        { error: data.message || "Cashfree order failed" },
        { status: 400 }
      );
    }

    /* -------------------------------
       7️⃣ Success Response
    -------------------------------- */
    return NextResponse.json(
      {
        success: true,
        payment_session_id: data.payment_session_id,
        order_id: data.order_id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 Cashfree order error:", error.message || error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}