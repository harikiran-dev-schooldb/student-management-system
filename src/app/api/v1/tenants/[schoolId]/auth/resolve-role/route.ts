export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tenantSlugGuard } from "@/lib/tenantGuard";

/* =======================================================
   GET  /api/v1/tenants/[schoolId]/auth/resolve-role
======================================================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;

    const { access, error } = await tenantSlugGuard(schoolSlug);

    if (error) return error;

    return NextResponse.json({
      role: access.role,
      classId: access.classId,
      studentId: access.studentId,
    });

  } catch (error) {
    console.error("resolve-role error:", error);

    return NextResponse.json(
      { error: "Failed to resolve role" },
      { status: 500 }
    );
  }
}