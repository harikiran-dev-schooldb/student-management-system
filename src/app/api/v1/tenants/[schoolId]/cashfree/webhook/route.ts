export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log("✅ Webhook received:", body);

        const event = body?.type;
        const orderId = body?.data?.order?.order_id;
        const paymentId = body?.data?.payment?.cf_payment_id;

        if (!orderId) {
            console.error("❌ Missing order_id");
            return NextResponse.json({ status: "ignored" });
        }

        /* -------------------------------
           PAYMENT SUCCESS
        -------------------------------- */
        if (event === "PAYMENT_SUCCESS") {
            await prisma.feePayment.updateMany({
                where: { orderId },
                data: {
                    status: "SUCCESS",
                    transactionId: paymentId,
                },
            });

            console.log(`✅ Payment success: ${orderId}`);
        }

        /* -------------------------------
           PAYMENT FAILED
        -------------------------------- */
        if (event === "PAYMENT_FAILED") {
            await prisma.feePayment.updateMany({
                where: { orderId },
                data: {
                    status: "FAILED",
                },
            });

            console.log(`❌ Payment failed: ${orderId}`);
        }

        return NextResponse.json({ status: "OK" });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}