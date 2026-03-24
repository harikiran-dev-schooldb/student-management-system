export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* 1️⃣ Resolve tenant */

    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    /* 2️⃣ Fetch academic years */

    const years = await db.academicYear.findMany({
      where: { schoolId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true, // make sure your schema has this
      },
    });

    return NextResponse.json(years);

  } catch (error) {
    console.error("Academic Years API Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch academic years" },
      { status: 500 }
    );
  }
}