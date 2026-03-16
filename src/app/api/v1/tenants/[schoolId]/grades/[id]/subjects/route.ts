import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> },
) {
  try {
    /* ================================
       Resolve Tenant
    ================================= */

    const { schoolId: slug, id } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const schoolId = access.schoolId;
    const gradeId = Number(id);

    if (isNaN(gradeId)) {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }

    /* 1️⃣ Validate Grade (Tenant Safe) */
    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        schoolId,
      },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    /* 2️⃣ Fetch Subjects */
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        grades: {
          some: { id: gradeId },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ subjects }, { status: 200 });

  } catch (error) {
    console.error("Fetch grade subjects error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}