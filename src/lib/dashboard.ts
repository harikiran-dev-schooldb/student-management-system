// src/lib/dashboard.ts
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getAdminDashboardData = unstable_cache(
  async () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const [
      adminCount,
      teacherCount,
      studentCount,
      genderStats,
      attendance,
      events,
      financeRaw,
    ] = await Promise.all([
      prisma.admin.count(),
      prisma.teacher.count(),
      prisma.student.count({ where: { status: "ACTIVE" } }),

      prisma.student.groupBy({
        by: ["gender"],
        where: { status: "ACTIVE" },
        _count: true,
      }),

      prisma.attendance.findMany({
        where: { date: { gte: start, lte: end } },
        select: { date: true, present: true },
      }),

      prisma.event.findMany({
        where: { startTime: { gte: start, lte: end } },
        orderBy: { startTime: "desc" },
        take: 5,
      }),

      prisma.feeTransaction.groupBy({
        by: ["receiptDate"],
        where: {
          receiptDate: { gte: start, lte: end },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          receiptDate: "asc",
        },
      }),
    ]);

    const finance = financeRaw.map((row) => ({
      date: row.receiptDate.toISOString().split("T")[0],
      collected: row._sum.amount ?? 0,
    }));

    return {
      adminCount,
      teacherCount,
      studentCount,
      genderStats,
      attendance,
      events,
      finance,
    };
  },

  // ✅ Cache key
  ["admin-dashboard", "last-30-days"],

  // ⏱ Revalidate every 60 seconds
  { revalidate: 60 }
);
