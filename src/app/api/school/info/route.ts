import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headerList = await headers();   // 👈 await it
  const schoolId = headerList.get("x-school-id");

  if (!schoolId) {
    return NextResponse.json(
      { error: "School context missing" },
      { status: 400 }
    );
  }

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId },
    select: {
      name: true,
      logo: true,
    },
  });

  if (!school) {
    return NextResponse.json(
      { error: "Invalid school" },
      { status: 404 }
    );
  }

  return NextResponse.json(school);
}
