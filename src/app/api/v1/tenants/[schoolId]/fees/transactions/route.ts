export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { PaymentMode } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { buildReceiptNumber } from "@/lib/fees/generateReceipt";
import { generateFeeRemark } from "@/lib/fees/generateRemark";

/* ======================================================
   POST: RECORD PAYMENT
====================================================== */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedByName = user.fullName ?? user.username ?? "Unknown";

    const body = await req.json();

    const {
      studentFeesId,
      academicYearId,
      amount = 0,
      discountAmount = 0,
      fineAmount = 0,
      receiptDate,
      remarks,
      paymentMode = PaymentMode.CASH,
    } = body;

    if (!studentFeesId || !academicYearId) {
      return NextResponse.json(
        { message: "studentFeesId, academicYearId required" },
        { status: 400 }
      );
    }

    const parsedReceiptDate =
      receiptDate && !isNaN(Date.parse(receiptDate))
        ? new Date(receiptDate)
        : new Date();

    const academicYear = await db.academicYear.findUnique({
      where: { id: academicYearId },
      select: { name: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { message: "Academic year not found" },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      /* =========================
         1️⃣ Fetch Student Fee
      ========================= */

      const studentFee = await tx.studentFees.findUnique({
        where: { id: studentFeesId },
        include: {
          student: true,
          feeCycle: true,
          feeStructure: true,
        },
      });

      if (!studentFee) throw new Error("Student fee not found");

      const currentDue = studentFee.dueAmount ?? 0;

      const effectivePayment =
        Number(amount) + Number(discountAmount) - Number(fineAmount);

      if (effectivePayment > currentDue) {
        throw new Error(`Overpayment not allowed. Due: ₹${currentDue}`);
      }

      const cycleName = studentFee.feeCycle?.name ?? "Fee";

      const autoRemark =
        remarks || generateFeeRemark(cycleName, parsedReceiptDate);

      /* =========================
         2️⃣ Generate Receipt
      ========================= */

      const seq = await tx.receiptSequence.upsert({
        where: {
          schoolId_academicYearId: { schoolId, academicYearId },
        },
        update: { currentNo: { increment: 1 } },
        create: { schoolId, academicYearId, currentNo: 1 },
        select: { currentNo: true },
      });

      const receiptNo = buildReceiptNumber(
        academicYear.name,
        seq.currentNo
      );

      /* =========================
         3️⃣ Update StudentFees
      ========================= */

      const updatedFee = await tx.studentFees.update({
        where: { id: studentFee.id },
        data: {
          paidAmount: { increment: amount },
          discountAmount: { increment: discountAmount },
          fineAmount: { increment: fineAmount },

          // ✅ CORRECT FORMULA
          dueAmount: {
            decrement: amount + discountAmount - fineAmount,
          },

          receiptDate: parsedReceiptDate,
          paymentMode,
          remarks: autoRemark,
        },
      });

      /* =========================
         4️⃣ Update StudentTotalFees
      ========================= */

      const updatedTotal = await tx.studentTotalFees.upsert({
        where: {
          studentId_academicYearId_schoolId: {
            studentId: studentFee.studentId,
            schoolId,
            academicYearId,
          },
        },
        update: {
          totalPaidAmount: { increment: amount },
          totalDiscountAmount: { increment: discountAmount },
          totalFineAmount: { increment: fineAmount },

          // ✅ CORRECT
          dueAmount: {
            decrement: amount + discountAmount - fineAmount,
          },
        },
        create: {
          studentId: studentFee.studentId,
          schoolId,
          academicYearId,
          totalPaidAmount: amount,
          totalDiscountAmount: discountAmount,
          totalFineAmount: fineAmount,

          totalFeeAmount: 0, // safer, avoid wrong aggregation
          totalAbacusAmount: 0,

          dueAmount:
            (studentFee.dueAmount ?? 0) -
            (amount + discountAmount - fineAmount),
        },
      });

      /* =========================
         5️⃣ Create Transaction
      ========================= */

      const transaction = await tx.feeTransaction.create({
        data: {
          studentId: studentFee.studentId,
          studentFeesId: studentFee.id,
          feeCycleId: studentFee.feeCycleId,
          academicYearId,
          amount,
          discountAmount,
          fineAmount,
          receiptDate: parsedReceiptDate,
          receiptNo,
          paymentMode,
          remarks: autoRemark,
          updatedByName,
          transactionType: "PAYMENT",
          schoolId,
        },
      });

      /* =========================
         6️⃣ Notification
      ========================= */

      const school = await tx.schoolInfo.findUnique({
        where: { id: schoolId },
        select: { name: true },
      });

      await tx.messages.create({
        data: {
          type: "FEE_COLLECTION",
          message: getMessageContent("FEE_COLLECTION", {
            studentName: studentFee.student.name,
            className: null,
            schoolName: school?.name ?? "School",
            amount,
            feeCycleName: cycleName, // ✅ FIXED
            date: parsedReceiptDate,
          }),
          studentId: studentFee.studentId,
          schoolId,
          date: parsedReceiptDate,
        },
      });

      return { updatedFee, updatedTotal, transaction };
    });

    return NextResponse.json(
      { message: "Payment recorded successfully", ...result },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Fee transaction error:", error);

    return NextResponse.json(
      { message: error.message || "Payment failed" },
      { status: 400 }
    );
  }
}

/* ======================================================
   GET: FETCH TRANSACTIONS
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = { schoolId };

    if (from || to) {
      where.receiptDate = {};

      if (from) where.receiptDate.gte = new Date(from);

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.receiptDate.lte = end;
      }
    }

    const transactions = await db.feeTransaction.findMany({
      where,
      include: {
        feeCycle: { select: { name: true } },
        student: {
          select: {
            id: true,
            name: true,
            enrollments: {
              select: {
                class: { select: { name: true } },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        receiptDate: "desc",
      },
    });

    const formatted = transactions.map((t) => ({
      id: t.id,
      receiptNo: t.receiptNo,
      amount: Number(t.amount),
      discountAmount: Number(t.discountAmount ?? 0),
      fineAmount: Number(t.fineAmount ?? 0),
      feeCycle: t.feeCycle?.name ?? "Unknown",
      paymentMode: t.paymentMode,
      receiptDate: t.receiptDate,

      student: t.student
        ? {
            id: t.student.id,
            name: t.student.name,
            className:
              t.student.enrollments?.[0]?.class?.name ?? null,
          }
        : null,
    }));

    return NextResponse.json({ data: formatted });

  } catch (error: any) {
    console.error("Fetch transactions error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}