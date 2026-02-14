import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await req.json();
    if (!roleId) {
      return NextResponse.json({ error: "roleId is required" }, { status: 400 });
    }

    // ✅ Find profile with roles
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      include: { users: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const role = profile.users.find((r) => r.id === roleId);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // ✅ Update DB activeRoleId
    await prisma.profile.update({
      where: { id: profile.id },
      data: { activeUserId: roleId },
    });

    const client = await clerkClient();

    // ✅ Update Clerk metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: role.role,
        activeRoleId: role.id,
      },
    });

    return NextResponse.json({ success: true, activeRole: role });
  } catch (err) {
    console.error("Error in switch-role:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
