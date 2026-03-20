import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";



export async function assignFeesToStudent(tx: any, {
  studentId,
  gradeId,
  academicYearId,
  schoolId,
}: {
  studentId: string;
  gradeId: number;
  academicYearId: number;
  schoolId: string;
}) {
  const feeStructures: Prisma.FeeStructureGetPayload<{}>[] =
    await tx.feeStructure.findMany({
      where: {
        gradeId,
        academicYearId,
        schoolId,
      },
    });

  if (feeStructures.length === 0) return;

  await tx.studentFees.createMany({
    data: feeStructures.map((f) => ({
      studentId,
      feeStructureId: f.id,
      term: f.term,
      paidAmount: 0,
      discountAmount: 0,
      fineAmount: 0,
      abacusPaidAmount: 0,
      paymentMode: "CASH",
      academicYearId,
      schoolId,
    })),
    skipDuplicates: true,
  });

  const totalFeeAmount = feeStructures.reduce(
    (sum: number, f) =>
      sum + Number(f.termFees || 0) + Number(f.abacusFees || 0),
    0
  );

  const totalAbacusAmount = feeStructures.reduce(
    (sum: number, f) => sum + Number(f.abacusFees || 0),
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
      totalAbacusAmount,
      dueAmount: totalFeeAmount,
    },
    create: {
      studentId,
      academicYearId,
      schoolId,
      totalFeeAmount,
      totalAbacusAmount,
      totalPaidAmount: 0,
      totalDiscountAmount: 0,
      totalFineAmount: 0,
      dueAmount: totalFeeAmount,
    },
  });
}

export async function recalcStudentTotals({
  studentId,
  schoolId,
  academicYearId,
}: {
  studentId: string;
  schoolId: string;
  academicYearId: number;
}) {
  const fees = await prisma.studentFees.findMany({
    where: { studentId, schoolId, academicYearId },
    include: { feeStructure: true },
  });

  const totalFee = fees.reduce(
    (sum, f) =>
      sum +
      Number(f.feeStructure?.termFees || 0) +
      Number(f.feeStructure?.abacusFees || 0),
    0
  );

  const tx = await prisma.feeTransaction.aggregate({
    where: { studentId, schoolId, academicYearId },
    _sum: {
      amount: true,
      discountAmount: true,
      fineAmount: true,
    },
  });

  const paid = Number(tx._sum.amount || 0);
  const discount = Number(tx._sum.discountAmount || 0);
  const fine = Number(tx._sum.fineAmount || 0);

  const due = totalFee - paid - discount + fine;

  await prisma.studentTotalFees.update({
    where: {
      studentId_academicYearId_schoolId: {
        studentId,
        academicYearId,
        schoolId,
      },
    },
    data: {
      totalFeeAmount: totalFee,
      totalPaidAmount: paid,
      totalDiscountAmount: discount,
      totalFineAmount: fine,
      dueAmount: due,
    },
  });
}