// lib/fees.ts
import { tenantPrisma } from "./tenant-prisma";

export async function getGroupedStudentFees(
  schoolId: string,
  studentIds: string[]
) {
  if (studentIds.length === 0) return [];

  const db = tenantPrisma(schoolId);

  const fees = await db.studentFees.findMany({
    where: {
      studentId: { in: studentIds },
    },
    select: {
      studentId: true,
      paidAmount: true,
      discountAmount: true,
      fineAmount: true,
      abacusPaidAmount: true,
      feeStructure: {
        select: {
          termFees: true,
        },
      },
    },
  });

  const feeMap = new Map<
    string,
    {
      studentId: string;
      totalPaidAmount: number;
      totalDiscountAmount: number;
      totalFineAmount: number;
      totalAbacusAmount: number;
      totalFeeAmount: number;
      dueAmount: number;
      status: string;
    }
  >();

  for (const fee of fees) {
    const termFee = fee.feeStructure?.termFees || 0;

    if (!feeMap.has(fee.studentId)) {
      feeMap.set(fee.studentId, {
        studentId: fee.studentId,
        totalPaidAmount: 0,
        totalDiscountAmount: 0,
        totalFineAmount: 0,
        totalAbacusAmount: 0,
        totalFeeAmount: 0,
        dueAmount: 0,
        status: "Not Paid",
      });
    }

    const agg = feeMap.get(fee.studentId)!;

    agg.totalPaidAmount += fee.paidAmount;
    agg.totalDiscountAmount += fee.discountAmount;
    agg.totalFineAmount += fee.fineAmount;
    agg.totalAbacusAmount += fee.abacusPaidAmount || 0;
    agg.totalFeeAmount += termFee;
    agg.dueAmount += termFee - fee.paidAmount;
  }

  for (const agg of feeMap.values()) {
    agg.status =
      agg.totalPaidAmount >= agg.totalFeeAmount ? "Paid" : "Not Paid";
  }

  return Array.from(feeMap.values());
}
