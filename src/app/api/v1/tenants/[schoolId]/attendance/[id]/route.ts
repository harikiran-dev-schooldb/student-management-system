import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* =======================================================
   PUT  /attendance/{id}
======================================================= */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id } = await params;

    const access = await requireTenantAccess();

    if (access.schoolId !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { present } = await req.json();

    const existing = await prisma.attendance.findFirst({
      where: { id: parsedId, schoolId: access.schoolId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.attendance.update({
      where: { id: parsedId },
      data: { present },
    });

    return NextResponse.json({ success: true, attendance: updated });

  } catch (error) {
    console.error("Attendance PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}