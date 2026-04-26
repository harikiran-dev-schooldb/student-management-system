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
    /* ---------------- ENV ---------------- */
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const appId = process.env.CASHFREE_APP_ID!;
    const secretKey = process.env.CASHFREE_SECRET_KEY!;

    /* ---------------- TENANT ---------------- */
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    /* ---------------- BODY ---------------- */
    const body: CreateOrderBody = await req.json();

    const {
      amount,
      customer_name,
      customer_phone,
      studentId,
      academicYearId,
      terms,
    } = body;

    if (!amount || !studentId || !academicYearId || !terms?.length) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    /* ---------------- GET STUDENT ---------------- */
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        schoolId: true,
        enrollments: {
          where: { schoolId },
          orderBy: { academicYearId: "desc" },
          take: 1,
          include: {
            class: {
              include: {
                Grade: true,
              },
            },
          },
        },
      },
    });

    if (!student || student.enrollments.length === 0) {
      throw new Error("Student enrollment not found");
    }

    const enrollment = student.enrollments[0];
    const gradeId = enrollment.class.gradeId;
    const branchId = enrollment.class.Grade.branchId;

    /* ---------------- GET ACCOUNT MAPPING ---------------- */
    const account = await prisma.paymentAccount.findFirst({
      where: {
        schoolId,
        gradeId,
        branchId,
      },
    });

    if (!account) {
      throw new Error(
        `No payment account mapping for grade ${gradeId} / branch ${branchId}`
      );
    }

    /* ---------------- ORDER ID ---------------- */
    const orderId = `order_${slug}_${Date.now()}`;

    /* ---------------- SAVE PAYMENT ---------------- */
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
          gradeId,
          branchId,
          accountId: account.accountId, // useful for debugging
        },
      },
    });

    /* ---------------- CASHFREE ---------------- */
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

        /* 🔥 EASY SPLIT */
        order_splits: [
          {
            vendor_id: account.accountId, // 🔥 KEY LINE
            amount: amount,
          },
        ],

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

    /* ---------------- ERROR ---------------- */
    if (!cfRes.ok) {
      console.error("❌ Cashfree error:", data);

      await prisma.feePayment.update({
        where: { orderId },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: data.message || "Order failed" },
        { status: 400 }
      );
    }

    /* ---------------- SUCCESS ---------------- */
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