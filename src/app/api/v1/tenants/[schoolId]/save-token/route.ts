export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const resolvedSchoolId = await resolveSchoolId(schoolId);

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: user.id,
        schoolId: resolvedSchoolId,
      },
      create: {
        token,
        userId: user.id,
        schoolId: resolvedSchoolId,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SAVE TOKEN ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}