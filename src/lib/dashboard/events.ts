import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function getRecentEvents(
  schoolId: string,
  start: Date,
  end: Date
): Promise<any[]> {
  const key = `dashboard:events:${schoolId}`;

  const cached = await redis.get<any[]>(key);
  if (cached) return cached;

  const events = await prisma.event.findMany({
    where: {
      schoolId,
      startTime: { gte: start, lte: end },
    },
    orderBy: { startTime: "desc" },
    take: 5,
  });

  await redis.set(key, events, { ex: 300 });

  return events;
}