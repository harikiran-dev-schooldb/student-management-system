import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { AttendanceRecord } from "../../../types";

export async function getAttendanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<AttendanceRecord[]> {
  const key = `dashboard:attendance:${schoolId}:${start.toISOString()}`;

  const cached = await redis.get<AttendanceRecord[]>(key);
  if (cached) return cached;

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

  const attendance: AttendanceRecord[] = attendanceRaw.map((row) => ({
    date: row.date.toISOString().split("T")[0],
    present: row._count.studentId,
  }));

  await redis.set(key, attendance, { ex: 300 });

  return attendance;
}