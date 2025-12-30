import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getAdminDashboardData = (targetDate: Date) =>
  unstable_cache(
    async () => {
      /* ---------------------------------
         Date Range (Last 30 Days)
      ----------------------------------*/
      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);

      const start = new Date(targetDate);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);

      /* ---------------------------------
         Attendance (Per-Day Aggregation)
      ----------------------------------*/
      const attendanceRaw = await prisma.attendance.groupBy({
        by: ["date"],
        where: {
          date: { gte: start, lte: end },
          present: true,
        },
        _count: {
          studentId: true,
        },
      });

      const attendanceMap = new Map<string, number>(
        attendanceRaw.map((row) => [
          row.date.toISOString().split("T")[0],
          row._count.studentId,
        ])
      );

      const attendance: { date: string; present: number }[] = [];
      const attendanceCursor = new Date(start);

      while (attendanceCursor <= end) {
        const dateStr = attendanceCursor.toISOString().split("T")[0];

        attendance.push({
          date: dateStr,
          present: attendanceMap.get(dateStr) ?? 0,
        });

        attendanceCursor.setDate(attendanceCursor.getDate() + 1);
      }

      /* ---------------------------------
         Parallel Dashboard Queries
      ----------------------------------*/
      const [
        adminCount,
        teacherCount,
        studentCount,
        genderStats,
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

      /* ---------------------------------
         Finance (Fill Missing Dates)
      ----------------------------------*/
      const financeMap = new Map<string, number>(
        financeRaw.map((row) => [
          row.receiptDate.toISOString().split("T")[0],
          row._sum.amount ?? 0,
        ])
      );

      const finance: { date: string; collected: number }[] = [];
      const financeCursor = new Date(start);

      while (financeCursor <= end) {
        const dateStr = financeCursor.toISOString().split("T")[0];

        finance.push({
          date: dateStr,
          collected: financeMap.get(dateStr) ?? 0,
        });

        financeCursor.setDate(financeCursor.getDate() + 1);
      }

      /* ---------------------------------
         Final Payload
      ----------------------------------*/
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
