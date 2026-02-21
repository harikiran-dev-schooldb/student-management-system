import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Authenticate Clerk User
    ------------------------------ */
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       2️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       3️⃣ Parse Body
    ------------------------------ */
    const { roleId } = await req.json();

    if (!roleId || typeof roleId !== "string") {
      return NextResponse.json(
        { error: "roleId is required" },
        { status: 400 }
      );
    }

    /* -----------------------------
       4️⃣ Fetch Profile
    ------------------------------ */
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: clerkId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       5️⃣ Validate LinkedUser (Tenant Safe)
    ------------------------------ */
    const linkedUser = await prisma.linkedUser.findFirst({
      where: {
        id: roleId,
        profileId: profile.id,
        schoolId, // 🔒 critical tenant isolation
      },
      select: {
        id: true,
        role: true,
        schoolId: true,
      },
    });

    if (!linkedUser) {
      return NextResponse.json(
        { error: "Invalid role selection" },
        { status: 403 }
      );
    }

    /* -----------------------------
       6️⃣ Update Active User
    ------------------------------ */
    await prisma.profile.update({
      where: { id: profile.id },
      data: { activeUserId: linkedUser.id },
    });

    /* -----------------------------
       7️⃣ Update Clerk Metadata
    ------------------------------ */
    const client = await clerkClient();

    await client.users.updateUser(clerkId, {
      publicMetadata: {
        role: linkedUser.role,
        activeRoleId: linkedUser.id,
        schoolId, // keep tenant in metadata
      },
    });

    return NextResponse.json(
      {
        success: true,
        activeRole: linkedUser.role,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Switch profile error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}