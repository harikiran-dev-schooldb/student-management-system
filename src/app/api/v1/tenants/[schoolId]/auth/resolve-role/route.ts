import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* =======================================================
   GET  /api/v1/tenants/[schoolId]/auth/resolve-role
======================================================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;

    const access = await requireTenantAccess();

    // 🔐 Tenant isolation
    if (access.schoolSlug !== schoolSlug) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // If requireTenantAccess passes,
    // user is authenticated and linked to school

    return NextResponse.json({
      role: access.role,
      userId: access.userId,
    });

  } catch (error) {
    console.error("resolve-role error:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
