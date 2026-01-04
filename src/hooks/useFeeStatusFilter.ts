import { getTermStatus } from "@/lib/utils/getTermStatus";

interface UseFeeStatusFilterArgs<T> {
  data: T[];
  feeMap: Map<string, any>;
  feeStatus?: string;
  getMeta: (item: T) => {
    totalFeeAmount: number;
    paidAmount: number;
    abacusAmount: number;
    discountAmount: number;
    isPreKg: boolean;
  };
}

export function useFeeStatusFilter<T>({
  data,
  feeMap,
  feeStatus,
  getMeta,
}: UseFeeStatusFilterArgs<T>) {
  if (!feeStatus) return data;

  return data.filter((item) => {
    const meta = getMeta(item);

    const dueAmount =
      meta.totalFeeAmount -
      meta.paidAmount -
      meta.abacusAmount -
      meta.discountAmount;

    const { status } = getTermStatus({
      dueAmount,
      paidAmount: meta.paidAmount,
      abacusAmount: meta.abacusAmount,
      totalFeeAmount: meta.totalFeeAmount,
      isPreKg: meta.isPreKg,
    });

    return status === feeStatus;
  });
}
