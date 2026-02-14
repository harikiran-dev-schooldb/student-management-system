import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      include: {
        users: {
          select: {
            id: true,
            role: true,
            username: true,
            profileId: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      phone: profile.phone,
      clerk_id: profile.clerk_id,
      activeRoleId: profile.activeUserId,
      roles: profile.users,
    });
  } catch (error) {
    console.error("API /profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
