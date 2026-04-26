export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { Term } from "@prisma/client";

type CreateOrderBody = {
  amount: number;
  customer_name?: string;
  customer_phone?: string;
  studentId: string;
  academicYearId: number;
  terms: Term[];
};

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

    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("APP_ID:", appId);
    console.log("SECRET_KEY:", secretKey);
    console.log("BASE URL:", baseUrl);

    if (!baseUrl || !appId || !secretKey) {
      throw new Error("Missing required environment variables");
    }

    /* -------------------------------
       2️⃣ TENANT RESOLUTION
    -------------------------------- */
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    /* -------------------------------
       3️⃣ BODY VALIDATION
    -------------------------------- */
    const body: CreateOrderBody = await req.json();

    const {
      amount,
      customer_name,
      customer_phone,
      studentId,
      academicYearId,
      terms,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    if (!academicYearId) {
      return NextResponse.json(
        { error: "Academic year required" },
        { status: 400 }
      );
    }

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json({ error: "Terms required" }, { status: 400 });
    }

    /* -------------------------------
       4️⃣ GENERATE ORDER ID
    -------------------------------- */
    const orderId = `order_${slug}_${Date.now()}`;

    /* -------------------------------
       5️⃣ SAVE PAYMENT INTENT
    -------------------------------- */
    await prisma.feePayment.create({
      data: {
        orderId,
        amount,
        status: "PENDING",
        schoolId,
        studentId,
        metadata: {
          terms,
          academicYearId,
        },
      },
    });

    /* -------------------------------
       6️⃣ CASHFREE ORDER CREATE
    -------------------------------- */
    const base =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const cfRes = await fetch(`${base}/orders`, {
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

    const data = await cfRes.json();

    /* -------------------------------
       7️⃣ HANDLE FAILURE (ROLLBACK)
    -------------------------------- */
    if (!cfRes.ok) {
      console.error("❌ Cashfree error:", data);

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
       8️⃣ SUCCESS RESPONSE
    -------------------------------- */
    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
    });
  } catch (err: any) {
    console.error("🔥 Order API error:", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}