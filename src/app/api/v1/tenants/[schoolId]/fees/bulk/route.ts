export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PaymentMode } from "@prisma/client";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { buildReceiptNumber } from "@/lib/fees/generateReceipt";

const CONCURRENCY_LIMIT = 8;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);
    const user = await fetchUserInfo(schoolSlug);

    const { records } = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Invalid input array" },
        { status: 400 }
      );
    }

    // ✅ Fetch active academic year ONCE (optimization)
    const activeYear = await db.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    const processRecord = async (record: any) => {
      const {
        studentId,
        term,
        amount = 0,
        discountAmount = 0,
        fineAmount = 0,
        receiptDate,
        receiptNo,
        remarks,
        paymentMode = PaymentMode.CASH,
      } = record;

      // ✅ Validation
      if (!studentId || !term || Number(amount) < 0) {
        return {
          studentId,
          status: "error",
          message: "Missing required fields",
        };
      }



      try {
        await db.$transaction(async (tx) => {
          // ✅ Check student
          const student = await tx.student.findUnique({
            where: { id: studentId },
          });

          if (!student) throw new Error("Student not found");

          const studentFee = await tx.studentFees.findUnique({
            where: {
              studentId_academicYear_term: {
                studentId,
                academicYearId: activeYear.id,
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
            Number(amount) +
            Number(discountAmount) +
            Number(fineAmount);

          if (incoming > due) {
            throw new Error(`Overpayment not allowed. Due: ₹${due}`);
          }

          // 🔥 Generate receipt sequence safely
          const seq = await tx.receiptSequence.upsert({
            where: {
              schoolId_academicYearId: {
                schoolId,
                academicYearId: activeYear.id,
              },
            },
            update: {
              currentNo: { increment: 1 },
            },
            create: {
              schoolId,
              academicYearId: activeYear.id,
              currentNo: 1,
            },
            select: {
              currentNo: true,
            },
          });

          // 🔥 Generate receipt number using your function
          const generatedReceiptNo = buildReceiptNumber(
            activeYear.name,
            seq.currentNo
          );


          // ✅ Update studentFees
          await tx.studentFees.update({
            where: { id: studentFee.id },
            data: {
              paidAmount: { increment: Number(amount) },
              discountAmount: { increment: Number(discountAmount) },
              fineAmount: { increment: Number(fineAmount) },
              paymentMode,
              remarks,
              receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
              receiptNo: generatedReceiptNo,
              updatedByName: user?.userId,
            },
          });

          // ✅ Update totals
          await tx.studentTotalFees.upsert({
            where: {
              studentId_academicYearId_schoolId: {
                studentId,
                academicYearId: activeYear.id,
                schoolId,
              },
            },
            update: {
              totalPaidAmount: { increment: Number(amount) },
              totalDiscountAmount: { increment: Number(discountAmount) },
              totalFineAmount: { increment: Number(fineAmount) },
              totalFeeAmount: { increment: incoming },
            },
            create: {
              studentId,
              schoolId,
              academicYearId: activeYear.id,
              totalPaidAmount: Number(amount),
              totalDiscountAmount: Number(discountAmount),
              totalFineAmount: Number(fineAmount),
              totalFeeAmount: incoming,
              totalAbacusAmount: 0,
              dueAmount: 0,
            },
          });

          // ✅ Create transaction
          await tx.feeTransaction.create({
            data: {
              studentId,
              studentFeesId: studentFee.id,
              term,
              academicYearId: activeYear.id,
              amount: Number(amount),
              discountAmount: Number(discountAmount),
              fineAmount: Number(fineAmount),
              receiptDate: receiptDate
                ? new Date(receiptDate)
                : new Date(),
              receiptNo: generatedReceiptNo,
              paymentMode,
              remarks,
              updatedByName: user?.userId,
              transactionType: "PAYMENT",
              schoolId,
            },
          });
        });

        return { studentId, status: "success" };
      } catch (err: any) {
        return {
          studentId,
          status: "error",
          message: err.message,
        };
      }
    };

    // ✅ Batch processing
    for (let i = 0; i < records.length; i += CONCURRENCY_LIMIT) {
      const batch = records.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = [];

      for (const r of batch) {
        const result = await processRecord(r);
        batchResults.push(result);
      }
      results.push(...batchResults);
    }

    return NextResponse.json({
      message: "Bulk fee collection completed",
      processed: records.length,
      results,
    });
  } catch (error) {
    console.error("Bulk fee error:", error);

    return NextResponse.json(
      { error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}