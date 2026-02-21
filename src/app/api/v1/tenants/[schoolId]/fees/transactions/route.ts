import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { PaymentMode } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { calculateDueAmount } from "@/lib/fees/fees";
import { getMessageContent } from "@/lib/utils/messageUtils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedByName = user.fullName ?? user.username ?? "Unknown";

    const body = await req.json();

    const {
      studentId,
      term,
      academicYear,
      amount = 0,
      discountAmount = 0,
      fineAmount = 0,
      receiptDate,
      receiptNo,
      remarks,
      paymentMode = PaymentMode.CASH,
    } = body;

    if (!studentId || !term || !academicYear) {
      return NextResponse.json(
        { message: "studentId, term, academicYear required" },
        { status: 400 },
      );
    }

    /* ------------- TRANSACTION WRAPPER (CRITICAL) ------------- */
    const result = await prisma.$transaction(async (tx) => {
      const studentFee = await tx.studentFees.findUnique({
        where: {
          studentId_academicYear_term: {
            studentId,
            academicYear,
            term,
            schoolId,
          },
        },
      });

      if (!studentFee) {
        throw new Error("Student fee record not found");
      }

      const dueAmount = calculateDueAmount(studentFee);
      const incomingTotal = amount + discountAmount + fineAmount;

      if (incomingTotal > dueAmount) {
        throw new Error("Overpayment not allowed");
      }

      const parsedReceiptDate =
        receiptDate && !isNaN(Date.parse(receiptDate))
          ? new Date(receiptDate)
          : new Date();

      const updatedFee = await tx.studentFees.update({
        where: { id: studentFee.id },
        data: {
          paidAmount: { increment: amount },
          discountAmount: { increment: discountAmount },
          fineAmount: { increment: fineAmount },
          receiptDate: parsedReceiptDate,
          paymentMode,
          remarks,
          ...(receiptNo && { receiptNo: String(receiptNo) }),
        },
      });

      const updatedTotal = await tx.studentTotalFees.upsert({
        where: {
          studentId_schoolId: { studentId, schoolId },
        },
        update: {
          totalPaidAmount: { increment: amount },
          totalDiscountAmount: { increment: discountAmount },
          totalFineAmount: { increment: fineAmount },
          totalFeeAmount: { increment: incomingTotal },
        },
        create: {
          studentId,
          schoolId,
          totalPaidAmount: amount,
          totalDiscountAmount: discountAmount,
          totalFineAmount: fineAmount,
          totalFeeAmount: incomingTotal,
          totalAbacusAmount: 0,
        },
      });

      const transaction = await tx.feeTransaction.create({
        data: {
          studentId,
          academicYear,
          term,
          studentFeesId: studentFee.id,
          amount,
          discountAmount,
          fineAmount,
          receiptDate: parsedReceiptDate,
          receiptNo: String(receiptNo || ""),
          paymentMode,
          remarks,
          updatedByName,
          schoolId,
        },
      });

      return { updatedFee, updatedTotal, transaction };
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        ...result,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fee transaction error:", error);

    return NextResponse.json(
      { message: error.message || "Payment failed" },
      { status: 400 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { searchParams } = new URL(req.url);

    const receiptDate = searchParams.get("receiptDate");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const academicYear = searchParams.get("academicYear");
    const paymentMode = searchParams.get("paymentMode");
    const term = searchParams.get("term");
    const studentId = searchParams.get("studentId");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const where: any = { schoolId };

    /* ===========================
       Date Handling (Safe)
    ============================ */

    if (receiptDate) {
      const base = new Date(receiptDate);
      if (!isNaN(base.getTime())) {
        const start = new Date(base);
        start.setHours(0, 0, 0, 0);

        const end = new Date(base);
        end.setHours(23, 59, 59, 999);

        where.receiptDate = { gte: start, lte: end };
      }
    } else if (from || to) {
      where.receiptDate = {};

      if (from) {
        const start = new Date(from);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          where.receiptDate.gte = start;
        }
      }

      if (to) {
        const end = new Date(to);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          where.receiptDate.lte = end;
        }
      }
    } else {
      // Default: today
      const today = new Date();

      const start = new Date(today);
      start.setHours(0, 0, 0, 0);

      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      where.receiptDate = { gte: start, lte: end };
    }

    /* ===========================
       Optional Filters
    ============================ */

    if (academicYear) where.academicYear = academicYear;
    if (paymentMode) where.paymentMode = paymentMode;
    if (term) where.term = term;
    if (studentId) where.studentId = studentId;

    /* ===========================
       Query + Pagination
    ============================ */

    const [total, receipts] = await prisma.$transaction([
      prisma.feeTransaction.count({ where }),
      prisma.feeTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              Class: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: receipts,
    });
  } catch (error) {
    console.error("Fee transactions error:", error);

    return NextResponse.json(
      { error: "Failed to fetch fee transactions" },
      { status: 500 },
    );
  }
}
