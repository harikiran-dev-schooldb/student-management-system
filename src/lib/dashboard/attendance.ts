import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { AttendanceRecord } from "../../../types";

type AttendanceRow = {
  date: Date;
  present: bigint; // COUNT returns bigint in Postgres
};

export async function getAttendanceStats(
  schoolId: string,
  start: Date,
  end: Date
): Promise<AttendanceRecord[]> {
  const key = `dashboard:attendance:${schoolId}:${start.toISOString()}:${end.toISOString()}`;

  // 🔹 Cache read (safe)
  try {
    const cached = await redis.get<AttendanceRecord[]>(key);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  // 🔹 Raw SQL (faster than groupBy)
  const attendanceRaw = await prisma.$queryRaw<
    { date: Date; present: number }[]
  >`
  SELECT date, COUNT("studentId")::int as present
  FROM "Attendance"
  WHERE "schoolId" = ${schoolId}
    AND date BETWEEN ${start} AND ${end}
    AND present = true
  GROUP BY date
  ORDER BY date ASC
`;

  // 🔹 Transform (handle bigint)
  const attendance: AttendanceRecord[] = attendanceRaw.map((row) => ({
    date: row.date.toISOString().split("T")[0],
    present: row.present, // convert bigint → number
  }));

  // 🔹 Cache write (safe)
  try {
    await redis.set(key, attendance, { ex: 300 });
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return attendance;
}