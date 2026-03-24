import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { FinanceRecord } from "../../../types";

type FinanceRow = {
  date: Date;
  collected: number;
};

export async function getFinanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<FinanceRecord[]> {
  const cacheKey = `dashboard:finance:${schoolId}:${start.toISOString()}:${end.toISOString()}`;

  /* ---------- Cache (safe) ---------- */
  try {
    const cached = await redis.get<FinanceRecord[]>(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* ---------- Raw SQL (fast) ---------- */
  const financeRaw = await prisma.$queryRaw<FinanceRow[]>`
    SELECT "receiptDate" as date,
           COALESCE(SUM(amount), 0)::int as collected
    FROM "FeeTransaction"
    WHERE "schoolId" = ${schoolId}
      AND "deletedAt" IS NULL
      AND "transactionType" = 'PAYMENT'
      AND "receiptDate" BETWEEN ${start} AND ${end}
    GROUP BY "receiptDate"
    ORDER BY "receiptDate" ASC
  `;

  /* ---------- Transform ---------- */
  const finance: FinanceRecord[] = financeRaw.map((row) => ({
    date: row.date.toISOString().split("T")[0],
    collected: row.collected,
  }));

  /* ---------- Cache (safe) ---------- */
  try {
    await redis.set(cacheKey, finance, { ex: 300 });
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return finance;
}