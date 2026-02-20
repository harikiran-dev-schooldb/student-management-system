import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* =======================================================
   GET  /api/v1/public/school/[schoolId]
======================================================= */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId } = await context.params;

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
