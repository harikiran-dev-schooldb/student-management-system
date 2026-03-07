export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PaymentMode } from "@prisma/client";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

const CONCURRENCY_LIMIT = 8; // safe parallelism

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const user = await fetchUserInfo(schoolSlug);
    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Invalid input array" },
        { status: 400 },
      );
    }

    const results: any[] = [];

    /* ---------------------------------------------------
       Worker Function (single student transaction)
    --------------------------------------------------- */

    const processRecord = async (record: any) => {
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

      if (!studentId || !term || !academicYear || amount < 0) {
        return {
          studentId,
          status: "error",
          message: "Missing required fields",
        };
      }

      try {
        await db.$transaction(async (tx) => {

          const year = await tx.academicYear.findFirst({
            where: { id: academicYear, schoolId },
          });

          if (!year) throw new Error("Invalid academic year");

          const studentFee = await tx.studentFees.findUnique({
            where: {
              studentId_academicYear_term: {
                studentId,
                academicYearId: year.id,
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

          const incoming = amount + discountAmount + fineAmount;

          if (incoming > due) {
            throw new Error(`Overpayment not allowed. Due: ₹${due}`);
          }

          await tx.studentFees.update({
            where: { id: studentFee.id },
            data: {
              paidAmount: { increment: amount },
              discountAmount: { increment: discountAmount },
              fineAmount: { increment: fineAmount },
              paymentMode,
              remarks,
              receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
              receiptNo: receiptNo ? String(receiptNo) : null,
              updatedByName: user?.userId,
            },
          });

          await tx.studentTotalFees.upsert({
            where: {
              studentId_academicYearId_schoolId: {
                studentId,
                academicYearId: year.id,
                schoolId,
              },
            },
            update: {
              totalPaidAmount: { increment: amount },
              totalDiscountAmount: { increment: discountAmount },
              totalFineAmount: { increment: fineAmount },
              totalFeeAmount: { increment: incoming },
            },
            create: {
              studentId,
              schoolId,
              academicYearId: year.id,
              totalPaidAmount: amount,
              totalDiscountAmount: discountAmount,
              totalFineAmount: fineAmount,
              totalFeeAmount: incoming,
              totalAbacusAmount: 0,
              dueAmount: 0,
            },
          });

          await tx.feeTransaction.create({
            data: {
              studentId,
              studentFeesId: studentFee.id,
              term,
              academicYearId: year.id,
              amount,
              discountAmount,
              fineAmount,
              receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
              receiptNo: receiptNo ? String(receiptNo) : "",
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

    /* ---------------------------------------------------
       Parallel Batch Processing
    --------------------------------------------------- */

    for (let i = 0; i < records.length; i += CONCURRENCY_LIMIT) {
      const batch = records.slice(i, i + CONCURRENCY_LIMIT);

      const batchResults = await Promise.all(
        batch.map((r) => processRecord(r)),
      );

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
      { status: 500 },
    );
  }
}