import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { FinanceRecord } from "../../../types";

type FinanceRow = {
  date: string;
  collected: number;
};

export async function getFinanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<FinanceRecord[]> {
  const cacheKey = `dashboard:finance:${schoolId}:${start.getTime()}`;

  /* ---------- Cache GET ---------- */
  try {
    const cached = await redis.get<FinanceRecord[]>(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* ---------- Optimized SQL ---------- */
  const financeRaw = await prisma.$queryRaw<FinanceRow[]>`
    SELECT 
      DATE("receiptDate") as date,
      COALESCE(SUM(amount), 0)::int as collected
    FROM "FeeTransaction"
    WHERE "schoolId" = ${schoolId}
      AND "deletedAt" IS NULL
      AND "transactionType" = 'PAYMENT'
      AND "receiptDate" >= ${start}
      AND "receiptDate" <= ${end}
    GROUP BY DATE("receiptDate")
    ORDER BY date ASC
  `;

  /* ---------- Transform ---------- */
  const finance: FinanceRecord[] = financeRaw.map((row) => ({
    date: row.date,
    collected: row.collected,
  }));

  /* ---------- Cache SET ---------- */
  try {
    await redis.set(cacheKey, finance, { ex: 600 }); // 10 mins
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return finance;
}