import { unstable_cache } from "next/cache";
import { tenantPrisma } from "./tenant-prisma";

export const getAdminDashboardData = unstable_cache(
  async (schoolId: string, targetDate: Date) => {
    const db = tenantPrisma(schoolId);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(targetDate);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const attendanceRaw = await db.attendance.groupBy({
      by: ["date"],
      where: {
        date: { gte: start, lte: end },
        present: true,
      },
      _count: { studentId: true },
      orderBy: { date: "asc" },
    });

    const attendance = attendanceRaw.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      present: row._count.studentId,
    }));

    const [
      adminCount,
      teacherCount,
      studentCount,
      genderStats,
      events,
      financeRaw,
    ] = await Promise.all([
      db.admin.count(),
      db.teacher.count(),
      db.student.count({ where: { status: "ACTIVE" } }),
      db.student.groupBy({
        by: ["gender"],
        where: { status: "ACTIVE" },
        _count: true,
      }),
      db.event.findMany({
        where: { startTime: { gte: start, lte: end } },
        orderBy: { startTime: "desc" },
        take: 5,
      }),
      db.feeTransaction.groupBy({
        by: ["receiptDate"],
        where: { receiptDate: { gte: start, lte: end } },
        _sum: { amount: true },
        orderBy: { receiptDate: "asc" },
      }),
    ]);

    const financeMap = new Map<string, number>(
      financeRaw.map((row) => [
        row.receiptDate.toISOString().split("T")[0],
        row._sum.amount ?? 0,
      ]),
    );

    const finance: { date: string; collected: number }[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().split("T")[0];
      finance.push({
        date: dateStr,
        collected: financeMap.get(dateStr) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
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
  ["admin-dashboard"], // base cache key
  { revalidate: 60 },
);
