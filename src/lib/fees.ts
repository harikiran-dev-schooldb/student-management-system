import { tenantPrisma } from "./tenant-prisma";

export async function getGroupedStudentFees(
  schoolId: string,
  studentIds: string[]
) {
  if (studentIds.length === 0) return [];

  const db = tenantPrisma(schoolId);

  const result = await db.$queryRaw<
    {
      studentId: string;
      totalPaidAmount: unknown;
      totalDiscountAmount: unknown;
      totalFineAmount: unknown;
      dueAmount: unknown;
      totalFeeAmount: unknown;
    }[]
  >`
    SELECT 
      sf."studentId",
      COALESCE(SUM(sf."paidAmount"), 0) as "totalPaidAmount",
      COALESCE(SUM(sf."discountAmount"), 0) as "totalDiscountAmount",
      COALESCE(SUM(sf."fineAmount"), 0) as "totalFineAmount",
      COALESCE(SUM(sf."dueAmount"), 0) as "dueAmount",
      COALESCE(SUM(fs."amount"), 0) as "totalFeeAmount"
    FROM "StudentFees" sf
    LEFT JOIN "FeeStructure" fs 
      ON fs.id = sf."feeStructureId"
    WHERE sf."studentId" = ANY(${studentIds})
    GROUP BY sf."studentId"
  `;

  return result.map((r) => {
    // 🔥 Normalize everything to Number
    const totalPaidAmount = Number(r.totalPaidAmount);
    const totalDiscountAmount = Number(r.totalDiscountAmount);
    const totalFineAmount = Number(r.totalFineAmount);
    const totalFeeAmount = Number(r.totalFeeAmount);
    const dueAmount = Number(r.dueAmount);

    let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";

    if (dueAmount <= 0) status = "Paid";
    else if (totalPaidAmount > 0) status = "Partial";

    return {
      studentId: r.studentId,
      totalPaidAmount,
      totalDiscountAmount,
      totalFineAmount,
      totalFeeAmount,
      dueAmount,
      status,
    };
  });
}