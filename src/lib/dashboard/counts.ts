import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { UserCounts } from "../../../types";

export async function getUserCounts(
  schoolId: string
): Promise<UserCounts> {

  const cacheKey = `dashboard:counts:${schoolId}`;

  const cached = await redis.get<UserCounts>(cacheKey);

  if (cached) {
    return cached;
  }

  const [adminCount, teacherCount, studentCount] = await Promise.all([
    prisma.admin.count({ where: { schoolId } }),
    prisma.teacher.count({ where: { schoolId } }),
    prisma.student.count({
      where: { schoolId, status: "ACTIVE" },
    }),
  ]);

  const result: UserCounts = {
    adminCount,
    teacherCount,
    studentCount,
  };

  await redis.set(cacheKey, result, { ex: 300 });

  return result;
}