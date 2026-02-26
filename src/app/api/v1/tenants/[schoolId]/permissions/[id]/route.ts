export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { slipSchema } from "@/lib/formValidationSchemas";

/* ======================================================
   PUT → Update Permission Slip
====================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> }
) {
  try {
    const { schoolId: slug, id: slipIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);
    const slipId = Number(slipIdStr);

    

    const existingSlip = await prisma.permissionSlip.findFirst({
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

    /* -------------------------------
       Optional Student Validation
    -------------------------------- */
    if (data.studentId) {
      const student = await prisma.student.findFirst({
        where: { id: data.studentId, schoolId },
        include: { Class: { include: { Grade: true } } },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found in this school" },
          { status: 404 }
        );
      }
    }

    const updatedSlip = await prisma.permissionSlip.update({
      where: { id: slipId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedSlip },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Permission slip PUT error:", error);

    return NextResponse.json(
      {
        error:
          error?.name === "ZodError"
            ? "Validation failed"
            : "Failed to update permission slip",
      },
      { status: 400 }
    );
  }
}

/* ======================================================
   DELETE → Remove Permission Slip
====================================================== */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> }
) {
  try {
    const { schoolId: slug, id: slipIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);
    const slipId = Number(slipIdStr);

    const existingSlip = await prisma.permissionSlip.findFirst({
      where: { id: slipId, schoolId },
    });

    if (!existingSlip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 }
      );
    }

    await prisma.permissionSlip.delete({
      where: { id: slipId },
    });

    return NextResponse.json(
      { success: true, message: "Permission slip deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Permission slip DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete permission slip" },
      { status: 500 }
    );
  }
}