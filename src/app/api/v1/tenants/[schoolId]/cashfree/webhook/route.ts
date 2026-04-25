export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    /* -------------------------------
       1️⃣ Get RAW body (IMPORTANT)
    -------------------------------- */
    const rawBody = await req.text();

    /* -------------------------------
       2️⃣ Signature from header
    -------------------------------- */
    const signature =
  req.headers.get("x-webhook-signature") ||
  req.headers.get("x-cf-signature");

    if (!signature) {
      console.error("❌ Missing signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* -------------------------------
       3️⃣ Generate expected signature
    -------------------------------- */
    const expectedSignature = crypto
  .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
  .update(rawBody)
  .digest("hex");

    /* -------------------------------
       4️⃣ Compare signatures
    -------------------------------- */
    if (signature !== expectedSignature) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log([...req.headers.entries()]);

    /* -------------------------------
       5️⃣ Now safe to parse JSON
    -------------------------------- */
    const body = JSON.parse(rawBody);

    const event = body?.type;
    const orderId = body?.data?.order?.order_id;
    const paymentId = body?.data?.payment?.cf_payment_id;

    if (!orderId) {
      return NextResponse.json({ status: "ignored" });
    }

    /* -------------------------------
       6️⃣ Idempotency
    -------------------------------- */
    const existing = await prisma.feePayment.findUnique({
      where: { orderId },
    });

    if (!existing) {
      console.error("Order not found:", orderId);
      return NextResponse.json({ status: "not_found" });
    }

    if (existing.status === "SUCCESS") {
      return NextResponse.json({ status: "already_processed" });
    }

    /* -------------------------------
       7️⃣ Handle events
    -------------------------------- */
    if (event === "PAYMENT_SUCCESS_WEBHOOK") {
      await prisma.feePayment.update({
        where: { orderId },
        data: {
          status: "SUCCESS",
          transactionId: paymentId,
        },
      });

      console.log(`✅ Payment success: ${orderId}`);
    }

    if (event === "PAYMENT_FAILED_WEBHOOK") {
      await prisma.feePayment.update({
        where: { orderId },
        data: {
          status: "FAILED",
        },
      });

      console.log(`❌ Payment failed: ${orderId}`);
    }

    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}