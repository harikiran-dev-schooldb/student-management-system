import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { FinanceRecord } from "../../../types";

export async function getFinanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<FinanceRecord[]> {

  const cacheKey = `dashboard:finance:${schoolId}:${start.toISOString()}`;

  /* ---------- Redis Cache ---------- */

  const cached = await redis.get<FinanceRecord[]>(cacheKey);
  if (cached) {
    return cached;
  }

  /* ---------- Database Query ---------- */

  const financeRaw = await prisma.feeTransaction.groupBy({
    by: ["receiptDate"],
    where: {
      schoolId,
      deletedAt: null,
      transactionType: "PAYMENT",
      receiptDate: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      receiptDate: "asc",
    },
  });

  /* ---------- Transform Data ---------- */

  const finance: FinanceRecord[] = financeRaw.map((row) => ({
    date: row.receiptDate.toISOString().split("T")[0],
    collected: Number(row._sum.amount ?? 0),
  }));

  /* ---------- Store Cache ---------- */

  await redis.set(cacheKey, finance, {
    ex: 300, // 5 minutes
  });

  return finance;
}