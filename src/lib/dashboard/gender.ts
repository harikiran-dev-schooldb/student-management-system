import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { Gender } from "@prisma/client";
import { GenderStat } from "../../../types";

export async function getGenderStats(
  schoolId: string
): Promise<GenderStat[]> {

  const cacheKey = `dashboard:gender:${schoolId}`;

  const cached = await redis.get<GenderStat[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const genderRaw = await prisma.student.groupBy({
    by: ["gender"],
    where: {
      schoolId,
      status: "ACTIVE",
    },
    _count: { gender: true },
  });

  const genderStats: GenderStat[] = genderRaw.map((row) => ({
    gender: row.gender as Gender,
    _count: row._count.gender,
  }));

  await redis.set(cacheKey, genderStats, { ex: 600 });

  return genderStats;
}