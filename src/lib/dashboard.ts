import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getAdminDashboardData = (targetDate: Date) =>
  unstable_cache(
    async () => {
      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);

      const start = new Date(targetDate);
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

      // --- FINANCE DATA FILLING LOGIC ---
      
      // 1. Convert raw DB results into a Map for quick lookup
      const financeMap = new Map(
        financeRaw.map((row) => [
          row.receiptDate.toISOString().split("T")[0],
          row._sum.amount ?? 0,
        ])
      );

      // 2. Generate every single date in the 30-day range
      const finance = [];
      const iterateDate = new Date(start);
      
      while (iterateDate <= end) {
        const dateStr = iterateDate.toISOString().split("T")[0];
        
        finance.push({
          date: dateStr,
          // If the date exists in DB, use it; otherwise, default to 0
          collected: financeMap.get(dateStr) || 0,
        });

        // Move to the next day
        iterateDate.setDate(iterateDate.getDate() + 1);
      }

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
    ["admin-dashboard", targetDate.toISOString().split("T")[0]],
    { revalidate: 60 }
  )();