export const dynamic = "force-dynamic";
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
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "username is required" },
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
        username,
        profileId: profile.id,
        schoolId, // 🔒 critical tenant filter
      },
      select: {
        id: true,
        role: true,
        username: true,
      },
    });

    if (!linkedUser) {
      return NextResponse.json(
        { error: "Role not found for this username" },
        { status: 404 }
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
        username: linkedUser.username,
        schoolId, // keep tenant context
      },
    });

    return NextResponse.json(
      {
        success: true,
        activeRole: {
          id: linkedUser.id,
          role: linkedUser.role,
          username: linkedUser.username,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Switch role error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}