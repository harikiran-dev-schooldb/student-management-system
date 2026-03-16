export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantSlugGuard } from "@/lib/tenantGuard";

/* =======================================================
   PUT  /attendance/{id}
======================================================= */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const resolvedSchoolId = await resolveSchoolId(slug);

    if (!["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { present } = await req.json();

    const updated = await prisma.attendance.update({
      where: {
        id: parsedId,
        schoolId: resolvedSchoolId,
      },
      data: { present },
    });

    return NextResponse.json({
      success: true,
      attendance: updated,
    });

  } catch (error) {
    console.error("Attendance PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
