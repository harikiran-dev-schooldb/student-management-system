/* -------------------------------------------------
   Helpers
--------------------------------------------------*/
export function getTotalFees(fee: any) {
  return (
    (fee.feeStructure?.termFees ?? 0) +
    (fee.feeStructure?.abacusFees ?? 0)
  );
}

export function calculateDueAmount(fee: any) {
  return (
    getTotalFees(fee) -
    (fee.paidAmount ?? 0) -
    (fee.discountAmount ?? 0) +
    (fee.fineAmount ?? 0)
  );
}