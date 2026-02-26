import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "./resolveSchool";

export async function getAdminDashboardData(
  schoolSlug: string,
  targetDate: Date,
) {
  // ✅ Resolve FIRST
  const schoolId = await resolveSchoolId(schoolSlug);

  const cached = unstable_cache(
    async () => {
      /* ---------------- Date Range ---------------- */

      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);

      const start = new Date(targetDate);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);

      /* ---------------- Attendance ---------------- */

      const attendanceRaw = await prisma.attendance.groupBy({
        by: ["date"],
        where: {
          schoolId,
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

      /* ---------------- Parallel Queries ---------------- */

      const [
        adminCount,
        teacherCount,
        studentCount,
        genderStats,
        events,
        financeRaw,
      ] = await Promise.all([
        prisma.admin.count({
          where: { schoolId },
        }),

        prisma.teacher.count({
          where: { schoolId },
        }),

        prisma.student.count({
          where: {
            schoolId,
            status: "ACTIVE",
          },
        }),

        prisma.student.groupBy({
          by: ["gender"],
          where: {
            schoolId,
            status: "ACTIVE",
          },
          _count: true,
        }),

        prisma.event.findMany({
          where: {
            schoolId,
            startTime: { gte: start, lte: end },
          },
          orderBy: { startTime: "desc" },
          take: 5,
        }),

        prisma.feeTransaction.groupBy({
          by: ["receiptDate"],
          where: {
            schoolId,
            deletedAt: null,
            receiptDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
          orderBy: { receiptDate: "asc" },
        }),
      ]);

      /* ---------------- Finance Chart ---------------- */

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

    // ✅ Tenant-safe cache key
    ["admin-dashboard", schoolId, targetDate.toISOString()],
    { revalidate: 60 },
  );

  return cached();
}