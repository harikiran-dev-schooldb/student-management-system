export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
{ params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -------------------------------
       1️⃣ ENV
    -------------------------------- */
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const appId = process.env.CASHFREE_APP_ID!;
    const secretKey = process.env.CASHFREE_SECRET_KEY!;

    if (!baseUrl || !appId || !secretKey) {
      throw new Error("Missing environment variables");
    }

    /* -------------------------------
       2️⃣ Tenant
    -------------------------------- */
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    /* -------------------------------
       3️⃣ Body
    -------------------------------- */
    const { amount, customer_name, customer_phone, studentId } =
      await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    /* -------------------------------
       4️⃣ Order ID
    -------------------------------- */
    const orderId = `order_${slug}_${Date.now()}`;

    /* -------------------------------
       5️⃣ Save in DB (IMPORTANT)
    -------------------------------- */
    await prisma.feePayment.create({
      data: {
        orderId,
        amount,
        status: "PENDING",
        schoolId,
        studentId: studentId || null,
      },
    });

    /* -------------------------------
       6️⃣ Cashfree API
    -------------------------------- */
    const base =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const response = await fetch(`${base}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2025-01-01",
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
          customer_email: "test@test.com",
        },
        order_meta: {
          return_url: `${baseUrl}/${slug}/payment/success?order_id={order_id}`,
          notify_url: `${baseUrl}/api/v1/tenants/${slug}/cashfree/webhook`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cashfree error:", data);

      // rollback DB
      await prisma.feePayment.update({
        where: { orderId },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: data.message || "Order creation failed" },
        { status: 400 }
      );
    }

    /* -------------------------------
       7️⃣ Response
    -------------------------------- */
    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
    });
  } catch (err: any) {
    console.error("🔥 Order API error:", err);

    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}