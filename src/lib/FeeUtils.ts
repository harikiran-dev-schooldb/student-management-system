import { StudentFeesTable } from "../../types";

/* ----------------------------------------
   Format Date
---------------------------------------- */
export function formatDate(
  value: string | Date | undefined | null
): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB").replace(/\//g, "-");
}

/* ----------------------------------------
   Total Fees (Source: feeStructure.amount)
---------------------------------------- */
export function getTotalFees(fee: StudentFeesTable): number {
  return fee.feeStructure?.amount ?? 0;
}

/* ----------------------------------------
   Due Amount (Source: DB - NEVER recompute)
---------------------------------------- */
export function calculateDueAmount(fee: StudentFeesTable): number {
  return fee.dueAmount ?? 0;
}

/* ----------------------------------------
   Fee Status
---------------------------------------- */
export function getFeeStatus(fee: StudentFeesTable) {
  const dueAmount = calculateDueAmount(fee);
  const paidAmount = fee.paidAmount ?? 0;

  let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";

  if (dueAmount <= 0) status = "Paid";
  else if (paidAmount > 0) status = "Partial";

  return {
    status,
    paidAmount,
    totalFees: getTotalFees(fee),
    dueAmount,
    isCollectDisabled: dueAmount <= 0,
    isZero: paidAmount === 0,
  };
}