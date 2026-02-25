export function getAssignedFee(fee: any) {
  return (
    (fee.feeStructure?.termFees ?? 0) +
    (fee.feeStructure?.abacusFees ?? 0)
  );
}

export function calculateDueAmount(fee: any) {
  const assigned = getAssignedFee(fee);

  const due =
    assigned -
    (fee.paidAmount ?? 0) -
    (fee.discountAmount ?? 0) +
    (fee.fineAmount ?? 0);

  return Math.max(due, 0); // never negative
}