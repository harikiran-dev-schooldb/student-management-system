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
      dueAmount: true, // ✅ SOURCE OF TRUTH
      feeStructure: {
        select: {
          amount: true, // ✅ NEW FIELD
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
      totalFeeAmount: number;
      dueAmount: number;
      status: "Paid" | "Partial" | "Unpaid";
    }
  >();

  for (const fee of fees) {
    const totalFee = fee.feeStructure?.amount ?? 0;

    if (!feeMap.has(fee.studentId)) {
      feeMap.set(fee.studentId, {
        studentId: fee.studentId,
        totalPaidAmount: 0,
        totalDiscountAmount: 0,
        totalFineAmount: 0,
        totalFeeAmount: 0,
        dueAmount: 0,
        status: "Unpaid",
      });
    }

    const agg = feeMap.get(fee.studentId)!;

    agg.totalPaidAmount += fee.paidAmount ?? 0;
    agg.totalDiscountAmount += fee.discountAmount ?? 0;
    agg.totalFineAmount += fee.fineAmount ?? 0;
    agg.totalFeeAmount += totalFee;
    agg.dueAmount += fee.dueAmount ?? 0;
  }

  /* ---------- STATUS LOGIC ---------- */
  for (const agg of feeMap.values()) {
    if (agg.dueAmount <= 0) {
      agg.status = "Paid";
    } else if (agg.totalPaidAmount > 0) {
      agg.status = "Partial";
    } else {
      agg.status = "Unpaid";
    }
  }

  return Array.from(feeMap.values());
}