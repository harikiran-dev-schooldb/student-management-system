import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { AttendanceRecord } from "../../../types";

type AttendanceRow = {
  date: string;
  present: number;
};

export async function getAttendanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<AttendanceRecord[]> {
  const key = `dashboard:attendance:${schoolId}:${start.getTime()}`;

  /* ---------- Cache GET ---------- */
  try {
    const cached = await redis.get<AttendanceRecord[]>(key);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* ---------- Optimized SQL (with gap filling) ---------- */
  const attendanceRaw = await prisma.$queryRaw<AttendanceRow[]>`
    SELECT 
      d::date as date,
      COALESCE(COUNT(a."studentId"), 0)::int as present
    FROM generate_series(${start}, ${end}, interval '1 day') d
    LEFT JOIN "Attendance" a
      ON DATE(a."date") = d
      AND a."schoolId" = ${schoolId}
      AND a."present" = true
    GROUP BY d
    ORDER BY d ASC
  `;

  /* ---------- Transform ---------- */
  const attendance: AttendanceRecord[] = attendanceRaw.map((row) => ({
    date: row.date,
    present: row.present,
  }));

  /* ---------- Cache SET ---------- */
  try {
    await redis.set(key, attendance, { ex: 600 }); // 10 mins
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return attendance;
}