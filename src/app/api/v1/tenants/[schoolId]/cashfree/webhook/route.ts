export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const rawBody = await req.text();

    /* =========================
       SIGNATURE VERIFY
    ========================= */

    const signature =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-cf-signature");

    const timestamp = req.headers.get("x-webhook-timestamp");

    const isTestWebhook = req.headers
      .get("user-agent")
      ?.includes("Cashfree");

    if (!signature || !timestamp) {
      if (process.env.NODE_ENV !== "production" || isTestWebhook) {
        console.log("⚠️ Skipping signature check (test)");
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
        .update(timestamp + rawBody)
        .digest("base64");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    /* =========================
       PARSE BODY
    ========================= */

    const body = JSON.parse(rawBody);

    const event = body?.type;
    const orderId = body?.data?.order?.order_id;

    if (!orderId) {
      return NextResponse.json({ status: "ignored" });
    }

    /* =========================
       FETCH PAYMENT
    ========================= */

    const existing = await prisma.feePayment.findUnique({
      where: { orderId },
    });

    if (!existing) {
      return NextResponse.json({ status: "not_found" });
    }

    if (existing.status === "SUCCESS") {
      return NextResponse.json({ status: "already_processed" });
    }

    const payment = body?.data?.payment;

    const paymentAmount = Number(payment?.payment_amount);
    const transactionId = String(payment?.cf_payment_id);

    /* =========================
       SUCCESS FLOW
    ========================= */

    if (event === "PAYMENT_SUCCESS_WEBHOOK") {
      await prisma.$transaction(async (tx) => {
        /* 1️⃣ Update payment */
        await tx.feePayment.update({
          where: { orderId },
          data: {
            status: "SUCCESS",
            transactionId,
            amount: paymentAmount,
            metadata: body,
          },
        });

        /* 2️⃣ Metadata */
        const metadata = (existing.metadata ?? {}) as {
          feeCycleIds?: number[];
          academicYearId?: number;
        };

        const { feeCycleIds = [], academicYearId } = metadata;

        if (!feeCycleIds.length || !academicYearId) {
          throw new Error("Missing feeCycleIds / academicYearId");
        }

        const studentId = existing.studentId;
        const schoolId = existing.schoolId;

        /* 3️⃣ Fetch student fees */
        const feesList = await tx.studentFees.findMany({
          where: {
            studentId,
            academicYearId,
            feeCycleId: { in: feeCycleIds },
          },
          include: {
            feeStructure: true,
            feeCycle: true,
          },
          orderBy: {
            feeCycleId: "asc",
          },
        });

        let remaining = paymentAmount;

        /* 4️⃣ Process payments */
        for (const fee of feesList) {
          if (remaining <= 0) break;

          const expected = fee.feeStructure?.amount ?? 0;

          const paid = fee.paidAmount ?? 0;
          const discount = fee.discountAmount ?? 0;
          const fine = fee.fineAmount ?? 0;

          const due = expected - paid - discount + fine;

          if (due <= 0) continue;

          const payAmount = Math.min(due, remaining);

          /* Create transaction */
          await tx.feeTransaction.create({
            data: {
              studentId,
              studentFeesId: fee.id,
              feeCycleId: fee.feeCycleId,
              amount: payAmount,
              receiptDate: new Date(),
              receiptNo: `ONLINE-${Date.now()}`,
              paymentMode: "ONLINE",
              schoolId,
              academicYearId,
            },
          });

          /* Update studentFees */
          await tx.studentFees.update({
            where: { id: fee.id },
            data: {
              paidAmount: { increment: payAmount },
              dueAmount: {
                decrement: payAmount,
              },
            },
          });

          remaining -= payAmount;
        }

        /* 5️⃣ Update totals */
        const totals = await tx.studentFees.aggregate({
          where: {
            studentId,
            academicYearId,
          },
          _sum: {
            paidAmount: true,
            discountAmount: true,
            fineAmount: true,
            dueAmount: true,
          },
        });

        await tx.studentTotalFees.upsert({
          where: {
            studentId_academicYearId_schoolId: {
              studentId,
              academicYearId,
              schoolId,
            },
          },
          update: {
            totalPaidAmount: totals._sum.paidAmount ?? 0,
            totalDiscountAmount: totals._sum.discountAmount ?? 0,
            totalFineAmount: totals._sum.fineAmount ?? 0,
            dueAmount: totals._sum.dueAmount ?? 0,
          },
          create: {
            studentId,
            schoolId,
            academicYearId,
            totalPaidAmount: totals._sum.paidAmount ?? 0,
            totalDiscountAmount: totals._sum.discountAmount ?? 0,
            totalFineAmount: totals._sum.fineAmount ?? 0,
            totalFeeAmount: 0,
            totalAbacusAmount: 0,
            dueAmount: totals._sum.dueAmount ?? 0,
          },
        });
      });

      console.log("✅ PAYMENT PROCESSED:", orderId);
    }

    /* =========================
       FAILED FLOW
    ========================= */

    if (event === "PAYMENT_FAILED_WEBHOOK") {
      await prisma.feePayment.update({
        where: { orderId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}