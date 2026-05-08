export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");

    /* =========================
       RAW BODY
    ========================= */

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
        console.log("⚠️ Skipping signature verification (test mode)");
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
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
       PARSE WEBHOOK
    ========================= */

    const body = JSON.parse(rawBody);

    const event = body?.type;
    const orderId = body?.data?.order?.order_id;

    if (!orderId) {
      return NextResponse.json({
        status: "ignored",
      });
    }

    /* =========================
       FETCH PAYMENT
    ========================= */

    const existing = await prisma.feePayment.findUnique({
      where: { orderId },
    });

    if (!existing) {
      return NextResponse.json({
        status: "not_found",
      });
    }

    /* =========================
       PAYMENT FAILED
    ========================= */

    if (event === "PAYMENT_FAILED_WEBHOOK") {
      await prisma.feePayment.update({
        where: { orderId },
        data: {
          status: "FAILED",
        },
      });

      console.log("❌ PAYMENT FAILED", {
        orderId,
      });

      return NextResponse.json({
        status: "failed",
      });
    }

    /* =========================
       ONLY HANDLE SUCCESS
    ========================= */

    if (event !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({
        status: "ignored_event",
      });
    }

    /* =========================
       LOCK PAYMENT
    ========================= */

    const locked = await prisma.feePayment.updateMany({
      where: {
        orderId,
        status: "PENDING",
      },
      data: {
        status: "PROCESSING",
      },
    });

    if (locked.count === 0) {
      console.log(
        "⚠️ Webhook skipped: already processing or completed",
        orderId
      );

      return NextResponse.json({
        status: "already_processed",
      });
    }

    /* =========================
       PAYMENT DATA
    ========================= */

    const payment = body?.data?.payment;

    const paymentAmount = Number(payment?.payment_amount ?? 0);
    const transactionId = String(payment?.cf_payment_id ?? "");

    /* =========================
       METADATA
    ========================= */

    const metadata = (existing.metadata ?? {}) as {
      feeCycleIds?: number[];
      academicYearId?: number;
      transactionCharge?: number;
    };

    const transactionCharge = metadata.transactionCharge ?? 0;

    const feeAmount = paymentAmount - transactionCharge;

    if (feeAmount <= 0) {
      throw new Error("Invalid fee amount");
    }

    const { feeCycleIds = [], academicYearId } = metadata;

    if (!feeCycleIds.length || !academicYearId) {
      throw new Error("Missing feeCycleIds / academicYearId");
    }

    const studentId = existing.studentId;
    const schoolId = existing.schoolId;

    /* =========================
       PROCESS PAYMENT
    ========================= */

    await prisma.$transaction(async (tx) => {
      /* -------------------------
         UPDATE PAYMENT
      ------------------------- */

      await tx.feePayment.update({
        where: { orderId },
        data: {
          status: "SUCCESS",
          transactionId,
          amount: feeAmount,

          metadata: {
            ...(existing.metadata as object),
            webhook: body,
          },
        },
      });

      /* -------------------------
         FETCH FEES
      ------------------------- */

      const feesList = await tx.studentFees.findMany({
        where: {
          studentId,
          academicYearId,
          feeCycleId: {
            in: feeCycleIds,
          },
        },

        include: {
          feeStructure: true,
          feeCycle: true,
        },

        orderBy: {
          feeCycleId: "asc",
        },
      });

      let remaining = feeAmount;

      /* -------------------------
         APPLY PAYMENTS
      ------------------------- */

      for (const fee of feesList) {
        if (remaining <= 0) break;

        const expected = fee.feeStructure?.amount ?? 0;

        const paid = fee.paidAmount ?? 0;
        const discount = fee.discountAmount ?? 0;
        const fine = fee.fineAmount ?? 0;

        const due = expected - paid - discount + fine;

        if (due <= 0) continue;

        const payAmount = Math.min(due, remaining);

        /* -------------------------
           CREATE TRANSACTION
        ------------------------- */

        await tx.feeTransaction.create({
          data: {
            studentId,
            studentFeesId: fee.id,
            feeCycleId: fee.feeCycleId,

            admissionNo:
      (existing.metadata as any)?.admissionNo,

            amount: payAmount,

            receiptDate: new Date(),

            receiptNo: `ONL-${Date.now()}-${fee.id}`,

            paymentMode: "ONLINE",

            schoolId,
            academicYearId,
          },
        });

        /* -------------------------
           UPDATE STUDENT FEES
        ------------------------- */

        const newDue = Math.max(0, due - payAmount);

        await tx.studentFees.update({
          where: {
            id: fee.id,
          },

          data: {
            paidAmount: {
              increment: payAmount,
            },

            dueAmount: newDue,
          },
        });

        remaining -= payAmount;
      }

      /* -------------------------
         RECALCULATE TOTALS
      ------------------------- */

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
          totalDiscountAmount:
            totals._sum.discountAmount ?? 0,
          totalFineAmount: totals._sum.fineAmount ?? 0,
          dueAmount: totals._sum.dueAmount ?? 0,
        },

        create: {
          studentId,
          schoolId,
          academicYearId,

          totalPaidAmount: totals._sum.paidAmount ?? 0,
          totalDiscountAmount:
            totals._sum.discountAmount ?? 0,
          totalFineAmount: totals._sum.fineAmount ?? 0,

          totalFeeAmount: 0,
          totalAbacusAmount: 0,

          dueAmount: totals._sum.dueAmount ?? 0,
        },
      });
    });

    console.log("✅ PAYMENT PROCESSED", {
      orderId,
      paymentAmount,
      transactionCharge,
      feeAmount,
      transactionId,
    });

    return NextResponse.json({
      status: "success",
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);

    return NextResponse.json(
      {
        error: "Webhook failed",
      },
      {
        status: 500,
      }
    );
  }
}