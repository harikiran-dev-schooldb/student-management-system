import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const schools = await prisma.schoolInfo.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      name: true,
      schoolId: true
    },
    take: 10
  });

  return NextResponse.json(schools);
}