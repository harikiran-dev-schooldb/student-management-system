export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   POST → Switch Active Linked User (Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant Slug → ID
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       2️⃣ Get Authenticated Profile
    ------------------------------ */
    const user = await fetchUserInfo(schoolId);

    if (!user || !user.profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       3️⃣ Read Request Body
    ------------------------------ */
    const { linkedUserId } = await req.json();

    if (!linkedUserId) {
      return NextResponse.json(
        { error: "linkedUserId is required" },
        { status: 400 }
      );
    }

    /* -----------------------------
       4️⃣ Validate LinkedUser
          - Belongs to Profile
          - Belongs to School
    ------------------------------ */
    const linkedUser = await prisma.linkedUser.findFirst({
      where: {
        id: linkedUserId,
        profileId: user.profileId,
        schoolId,
      },
      select: { id: true },
    });

    if (!linkedUser) {
      return NextResponse.json(
        { error: "Invalid user selection" },
        { status: 403 }
      );
    }

    /* -----------------------------
       5️⃣ Update Active User
    ------------------------------ */
    await prisma.profile.update({
      where: { id: user.profileId },
      data: {
        activeUserId: linkedUserId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Active user switched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Set active user error:", error);

    return NextResponse.json(
      { error: "Failed to switch active user" },
      { status: 500 }
    );
  }
}