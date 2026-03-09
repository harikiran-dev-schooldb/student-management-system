import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {

    const { schoolId: slug, id: gradeIdStr } = await params;
    /* 🔐 Tenant Access */
    const access = await requireTenantAccess();

    if (access.schoolSlug !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* Resolve internal schoolId */
    const schoolId = await resolveSchoolId(slug);

    const gradeId = Number(gradeIdStr);

    /* Fetch classes */
    const classes = await prisma.class.findMany({
      where: {
        gradeId,
        schoolId,
      },
      orderBy: {
        section: "asc",
      },
      select: {
        id: true,
        name: true,
        section: true,
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Classes fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}