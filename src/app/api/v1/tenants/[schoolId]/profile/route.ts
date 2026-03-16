export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantGuard, tenantSlugGuard } from "@/lib/tenantGuard";

/* =======================================================
   GET  /api/v1/tenants/[schoolId]/profile
======================================================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const schoolId = access.schoolId;

    const profile = await prisma.profile.findUnique({
      where: { clerk_id: access.userId },
      include: {
        users: {
          where: { schoolId },
          select: {
            id: true,
            role: true,
            username: true,
            profileId: true,
            schoolId: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: profile.id,
      phone: profile.phone,
      clerk_id: profile.clerk_id,
      activeRoleId: profile.activeUserId,
      roles: profile.users,
    });

  } catch (error) {
    console.error("GET /profile error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}