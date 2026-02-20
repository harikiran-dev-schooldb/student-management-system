import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMode, AcademicYear } from "@prisma/client";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

    const user = await fetchUserInfo(schoolId);
    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can perform bulk fee collection" },
        { status: 403 }
      );
    }

    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Invalid input array" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const record of records) {
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
      } = record;

      if (!studentId || !term || !academicYear || amount <= 0) {
        results.push({
          studentId,
          status: "error",
          message: "Missing required fields",
        });
        continue;
      }

      if (
        !Object.values(AcademicYear).includes(
          academicYear as AcademicYear
        )
      ) {
        results.push({
          studentId,
          status: "error",
          message: "Invalid academicYear",
        });
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          /* 1️⃣ Fetch StudentFees */
          const studentFee = await tx.studentFees.findUnique({
            where: {
              studentId_academicYear_term: {
                studentId,
                academicYear,
                term,
                schoolId,
              },
            },
            include: { feeStructure: true },
          });

          if (!studentFee) {
            throw new Error("Student fee record not found");
          }

          const totalFees =
            (studentFee.feeStructure.termFees || 0) +
            (studentFee.feeStructure.abacusFees || 0);

          const due =
            totalFees -
            studentFee.paidAmount -
            studentFee.discountAmount +
            studentFee.fineAmount;

          const incoming =
            amount + discountAmount + fineAmount;

          if (incoming > due) {
            throw new Error(
              `Overpayment not allowed. Due: ₹${due}`
            );
          }

          /* 2️⃣ Update StudentFees */
          await tx.studentFees.update({
            where: { id: studentFee.id },
            data: {
              paidAmount: { increment: amount },
              discountAmount: { increment: discountAmount },
              fineAmount: { increment: fineAmount },
              paymentMode,
              remarks,
              receiptDate: receiptDate
                ? new Date(receiptDate)
                : new Date(),
              receiptNo: receiptNo
                ? String(receiptNo)
                : null,
              updatedByName: user.userId,
            },
          });

          /* 3️⃣ Update StudentTotalFees */
          await tx.studentTotalFees.upsert({
            where: {
              studentId_schoolId: {
                studentId,
                schoolId,
              },
            },
            update: {
              totalPaidAmount: { increment: amount },
              totalDiscountAmount: {
                increment: discountAmount,
              },
              totalFineAmount: { increment: fineAmount },
              totalFeeAmount: {
                increment: incoming,
              },
            },
            create: {
              studentId,
              schoolId,
              totalPaidAmount: amount,
              totalDiscountAmount: discountAmount,
              totalFineAmount: fineAmount,
              totalFeeAmount: incoming,
              totalAbacusAmount: 0,
            },
          });

          /* 4️⃣ Create FeeTransaction */
          await tx.feeTransaction.create({
            data: {
              studentId,
              studentFeesId: studentFee.id,
              term,
              academicYear,
              amount,
              discountAmount,
              fineAmount,
              receiptDate: receiptDate
                ? new Date(receiptDate)
                : new Date(),
              receiptNo: receiptNo
                ? String(receiptNo)
                : "",
              paymentMode,
              remarks,
              updatedByName: user.userId,
              transactionType: "PAYMENT",
              schoolId,
            },
          });
        });

        results.push({ studentId, status: "success" });
      } catch (err: any) {
        results.push({
          studentId,
          status: "error",
          message: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "Bulk fee collection completed",
      results,
    });

  } catch (error: any) {
    console.error("Bulk fee error:", error);

    return NextResponse.json(
      { error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
