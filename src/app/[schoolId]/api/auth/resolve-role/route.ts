import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ schoolId: string }>;
};

export async function GET(
  req: Request,
  context: RouteContext
) {
  const { schoolId } = await context.params;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId },
    select: { id: true },
  });

  if (!school) {
    return NextResponse.json(
      { error: "Invalid school" },
      { status: 400 }
    );
  }

  const linkedUser = await prisma.linkedUser.findFirst({
    where: {
      profile: { clerk_id: userId },
      schoolId: school.id,
    },
    select: {
      role: true,
    },
  });

  if (!linkedUser) {
    return NextResponse.json(
      { error: "Not allowed in this school" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    role: linkedUser.role,
  });
}
