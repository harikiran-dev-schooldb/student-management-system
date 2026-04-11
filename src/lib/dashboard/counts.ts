import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { UserCounts } from "../../../types";

export async function getUserCounts(
  schoolId: string
): Promise<UserCounts> {
  const cacheKey = `dashboard:counts:${schoolId}`;

  /* ---------- Cache GET ---------- */
  try {
    const cached = await redis.get<UserCounts>(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  /* ---------- Single DB Query ---------- */
  const queryResult = await prisma.$queryRaw<
    { admin_count: bigint; teacher_count: bigint; student_count: bigint }[]
  >`
    SELECT
      (SELECT COUNT(*) FROM "Admin" WHERE "schoolId" = ${schoolId}) AS admin_count,
      (SELECT COUNT(*) FROM "Teacher" WHERE "schoolId" = ${schoolId}) AS teacher_count,
      (SELECT COUNT(*) FROM "Student"
        WHERE "schoolId" = ${schoolId} AND status = 'ACTIVE'
      ) AS student_count
  `;

  const counts: UserCounts = {
    adminCount: Number(queryResult[0]?.admin_count ?? 0),
    teacherCount: Number(queryResult[0]?.teacher_count ?? 0),
    studentCount: Number(queryResult[0]?.student_count ?? 0),
  };

  /* ---------- Cache SET ---------- */
  try {
    await redis.set(cacheKey, counts, { ex: 1800 }); // 30 mins
  } catch (err) {
    console.error("Redis SET error:", err);
  }

  return counts;
}