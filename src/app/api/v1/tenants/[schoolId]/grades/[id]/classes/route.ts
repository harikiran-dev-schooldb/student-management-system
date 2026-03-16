import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {

    const { schoolId: slug, id: gradeIdStr } = await params;
    /* 🔐 Tenant Access */
    const { access, error } = await tenantSlugGuard(slug);

    if (error) return error;

    /* Resolve internal schoolId */
    const schoolId = access.schoolId;

    const gradeId = Number(gradeIdStr);

    /* Fetch classes */
    const classes = await prisma.class.findMany({
      where: {
        gradeId,
        schoolId,
      },
      orderBy: [
        { name: "asc" },
      ],
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