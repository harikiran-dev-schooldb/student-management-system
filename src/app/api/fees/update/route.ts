import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMode } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { calculateDueAmount } from "@/lib/fees/fees";



/* -------------------------------------------------
   POST Handler
--------------------------------------------------*/
export async function POST(req: NextRequest) {
  try {
    /* ---------- Auth ---------- */
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedByName =
      user.fullName ?? user.username ?? "Unknown";

    /* ---------- Parse Body ---------- */
    const body = await req.json();
    console.log("📦 Incoming body:", body);

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
        { message: "studentId, term, academicYear are required" },
        { status: 400 }
      );
    }

    /* ---------- Fetch Student Fee (Year + Term scoped) ---------- */
    const studentFee = await prisma.studentFees.findUnique({
      where: {
        studentId_academicYear_term: {
          studentId,
          academicYear,
          term,
        },
      },
      include: { feeStructure: true },
    });

    if (!studentFee) {
      return NextResponse.json(
        { message: "Student fee record not found" },
        { status: 404 }
      );
    }

    /* ---------- Validate Payment ---------- */
    const dueAmount = calculateDueAmount(studentFee);
    const incomingTotal = amount + discountAmount + fineAmount;

    if (incomingTotal > dueAmount) {
      return NextResponse.json(
        {
          message: `Overpayment not allowed. Due: ₹${dueAmount}, Attempted: ₹${incomingTotal}`,
        },
        { status: 400 }
      );
    }

    /* ---------- Receipt Date ---------- */
    const parsedReceiptDate =
      receiptDate && !isNaN(Date.parse(receiptDate))
        ? new Date(receiptDate)
        : new Date();

    /* ---------- Update Student Fees ---------- */
    const updatedFee = await prisma.studentFees.update({
      where: { id: studentFee.id },
      data: {
        paidAmount: studentFee.paidAmount + amount,
        discountAmount: studentFee.discountAmount + discountAmount,
        fineAmount: studentFee.fineAmount + fineAmount,
        remarks,
        paymentMode,
        receiptDate: parsedReceiptDate,
        ...(receiptNo && { receiptNo: String(receiptNo) }),
      },
    });

    /* ---------- Sync Receipt No (same academic year) ---------- */
    if (receiptNo) {
      await prisma.studentFees.updateMany({
        where: { studentId, academicYear },
        data: { receiptNo: String(receiptNo) },
      });
    }

    /* ---------- Update Student Totals ---------- */
    const updatedTotalFee = await prisma.studentTotalFees.upsert({
      where: { studentId },
      update: {
        totalPaidAmount: { increment: amount },
        totalDiscountAmount: { increment: discountAmount },
        totalFineAmount: { increment: fineAmount },
        totalFeeAmount: { increment: incomingTotal },
      },
      create: {
        studentId,
        totalPaidAmount: amount,
        totalDiscountAmount: discountAmount,
        totalFineAmount: fineAmount,
        totalFeeAmount: incomingTotal,
        totalAbacusAmount: 0,
      },
    });

    /* ---------- Create Transaction ---------- */
    const transaction = await prisma.feeTransaction.create({
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
      },
    });

    /* ---------- Log Message ---------- */
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        Class: { select: { id: true, section: true } },
      },
    });

    if (student) {
      const messageContent = getMessageContent("FEE_COLLECTION", {
        name: student.name,
        className: student.Class?.section ?? "",
        amount,
        term,
      });

      await prisma.messages.create({
        data: {
          studentId,
          classId: student.Class?.id ?? null,
          type: "FEE_COLLECTION",
          message: messageContent,
          date: new Date(),
        },
      });
    }

    console.log(
      `✅ Fee collected | Student: ${studentId} | Year: ${academicYear} | Term: ${term}`
    );

    return NextResponse.json(
      {
        message: "Fee updated and transaction recorded successfully",
        academicYear,
        updatedFee,
        updatedTotalFee,
        transaction,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ API Error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate record constraint violation", meta: error.meta },
        { status: 400 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { message: "Foreign key constraint failed", meta: error.meta },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
