export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { slipSchema } from "@/lib/formValidationSchemas";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const slipId = Number(id);

    if (Number.isNaN(slipId)) {
      return NextResponse.json(
        { error: "Invalid slip ID" },
        { status: 400 }
      );
    }

    const existingSlip = await db.permissionSlip.findFirst({
      where: { id: slipId, schoolId },
    });

    if (!existingSlip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const data = slipSchema.partial().parse(body);

    /* -------------------------
       Optional Student Check
    ------------------------- */
    if (data.studentId) {
      const student = await db.student.findFirst({
        where: { id: data.studentId, schoolId },
        select: { id: true },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found in this school" },
          { status: 404 }
        );
      }
    }

    const updatedSlip = await db.permissionSlip.update({
      where: { id: slipId },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });

    return NextResponse.json(
      { success: true, data: updatedSlip },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Permission slip PUT error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update permission slip" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE → Remove Permission Slip
====================================================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const slipId = Number(id);

    if (Number.isNaN(slipId)) {
      return NextResponse.json(
        { error: "Invalid slip ID" },
        { status: 400 }
      );
    }

    const existingSlip = await db.permissionSlip.findFirst({
      where: { id: slipId, schoolId },
    });

    if (!existingSlip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 }
      );
    }

    await db.permissionSlip.delete({
      where: { id: slipId },
    });

    return NextResponse.json({
      success: true,
      message: "Permission slip deleted successfully",
    });

  } catch (error) {
    console.error("Permission slip DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete permission slip" },
      { status: 500 }
    );
  }
}