import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

/* ----------------------------------------
   Assign Fees
---------------------------------------- */
export async function assignFeesToStudent(
  tx: Prisma.TransactionClient | any,
  {
    studentId,
    gradeId,
    academicYearId,
    schoolId,
  }: {
    studentId: string;
    gradeId: number;
    academicYearId: number;
    schoolId: string;
  }
) {
  const feeStructures: Prisma.FeeStructureGetPayload<{}>[] =
    await tx.feeStructure.findMany({
      where: { gradeId, academicYearId, schoolId },
    });

  if (feeStructures.length === 0) return;

  await tx.studentFees.createMany({
    data: feeStructures.map((f) => ({
      studentId,
      feeStructureId: f.id,
      feeCycleId: f.feeCycleId,
      paidAmount: 0,
      discountAmount: 0,
      fineAmount: 0,
      dueAmount: f.amount ?? 0,
      paymentMode: "CASH",
      academicYearId,
      schoolId,
    })),
    skipDuplicates: true,
  });

  const totalFeeAmount = feeStructures.reduce<number>(
    (sum, f) => sum + (f.amount ?? 0),
    0
  );

  await tx.studentTotalFees.upsert({
    where: {
      studentId_academicYearId_schoolId: {
        studentId,
        academicYearId,
        schoolId,
      },
    },
    update: {
      totalFeeAmount,
      dueAmount: totalFeeAmount,
    },
    create: {
      studentId,
      academicYearId,
      schoolId,
      totalFeeAmount,
      totalPaidAmount: 0,
      totalDiscountAmount: 0,
      totalFineAmount: 0,
      dueAmount: totalFeeAmount,
    },
  });
}

/* ----------------------------------------
   Recalculate Totals
---------------------------------------- */
export async function recalcStudentTotals({
  studentId,
  schoolId,
  academicYearId,
}: {
  studentId: string;
  schoolId: string;
  academicYearId: number;
}) {
  const fees: Prisma.StudentFeesGetPayload<{}>[] =
    await prisma.studentFees.findMany({
      where: { studentId, schoolId, academicYearId },
    });

  const totalPaid = fees.reduce<number>(
    (sum, f) => sum + (f.paidAmount ?? 0),
    0
  );

  const totalDiscount = fees.reduce<number>(
    (sum, f) => sum + (f.discountAmount ?? 0),
    0
  );

  const totalFine = fees.reduce<number>(
    (sum, f) => sum + (f.fineAmount ?? 0),
    0
  );

  const totalDue = fees.reduce<number>(
    (sum, f) => sum + (f.dueAmount ?? 0),
    0
  );

  /* ----------------------------------------
     Safer totalFee calculation
     (what student actually owes originally)
  ---------------------------------------- */
  const totalFeeAmount =
    totalPaid + totalDiscount + totalDue - totalFine;

  await prisma.studentTotalFees.update({
    where: {
      studentId_academicYearId_schoolId: {
        studentId,
        academicYearId,
        schoolId,
      },
    },
    data: {
      totalFeeAmount,
      totalPaidAmount: totalPaid,
      totalDiscountAmount: totalDiscount,
      totalFineAmount: totalFine,
      dueAmount: totalDue,
    },
  });
}