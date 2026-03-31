export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* ==============================
       1️⃣ INIT RAZORPAY
    ============================== */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    /* ==============================
       2️⃣ RESOLVE SCHOOL
    ============================== */
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    /* ==============================
       3️⃣ PARSE BODY (ONLY ONCE)
    ============================== */
    const body = await req.json();

    const {
      studentId,
      amount,
      terms,
      academicYearId,
    } = body;

    /* ==============================
       4️⃣ VALIDATION
    ============================== */
    if (!studentId) {
      return NextResponse.json(
        { error: "Student required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // if (!terms || !Array.isArray(terms) || terms.length === 0) {
    //   return NextResponse.json(
    //     { error: "At least one term required" },
    //     { status: 400 }
    //   );
    // }

    // optional fallback
    const finalAcademicYearId =
      academicYearId || body?.academicYearId || null;

    /* ==============================
       5️⃣ CREATE RAZORPAY ORDER
    ============================== */
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // rupees → paise
      currency: "INR",
      receipt: `receipt_${slug}_${Date.now()}`,
      notes: { schoolId },
    });

    /* ==============================
       6️⃣ SAVE PAYMENT (PENDING)
    ============================== */
    await prisma.feePayment.create({
      data: {
        orderId: order.id,
        amount: amount,
        currency: "INR",
        status: "PENDING",

        // ✅ REQUIRED RELATIONS
        student: {
          connect: { id: studentId },
        },
        school: {
          connect: { id: schoolId },
        },

        metadata: {
          terms,
          academicYear: finalAcademicYearId,
        },
      },
    });

    /* ==============================
       7️⃣ RESPONSE
    ============================== */
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount, // already in paise
      currency: order.currency,
    });

  } catch (err: any) {
    console.error("ORDER ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Order creation failed" },
      { status: 500 }
    );
  }
}