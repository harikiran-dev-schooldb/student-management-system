export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { slipSchema } from "@/lib/formValidationSchemas";

import { generatePermissionSlipPDF } from "@/lib/pdf/permissionSlipPdf";
import { getMessageContent } from "@/lib/utils/messageUtils";

/* ======================================================
   POST → Create Permission Slip (Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const school = await prisma.schoolInfo.findUnique({
      where: { id: schoolId },
      select: { name: true },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = slipSchema.parse(body);

    const student = await prisma.student.findFirst({
      where: { id: data.studentId, schoolId },
      include: {
        Class: { include: { Grade: true } },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in this school" },
        { status: 404 },
      );
    }

    const leaveDate = data.date ? new Date(data.date) : new Date();

    const newSlip = await prisma.permissionSlip.create({
      data: {
        studentId: data.studentId,
        leaveType: data.leaveType,
        subReason: data.subReason,
        description: data.description,
        date: leaveDate,
        withWhom: data.withWhom,
        relation: data.relation,
        schoolId,
      },
    });

    const pdfBase64 = await generatePermissionSlipPDF({
      schoolName: school.name,
      student,
      slip: newSlip,
    });

    const messageText = getMessageContent("PERMISSION_SLIP", {
      studentName: student.name,
      className: `${student.Class?.Grade?.level ?? ""} - ${
        student.Class?.section ?? ""
      }`,
      schoolName: school.name,
      date: leaveDate,
      leaveType: newSlip.leaveType,
      withWhom: newSlip.withWhom || undefined,
      relation: newSlip.relation || undefined,
    });

    await prisma.messages.create({
      data: {
        schoolId,
        studentId: student.id,
        message: messageText,
        type: "PERMISSION_SLIP",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newSlip,
        gateSlipPdf: `data:application/pdf;base64,${pdfBase64}`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Permission slip POST error:", error);

    return NextResponse.json(
      {
        error:
          error?.name === "ZodError"
            ? "Validation failed"
            : "Failed to create permission slip",
      },
      { status: 400 },
    );
  }
}

/* ======================================================
   GET → Fetch Single Permission Slip
====================================================== */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const slip = await prisma.permissionSlip.findFirst({
      where: {
        schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            Class: {
              include: { Grade: true },
            },
          },
        },
      },
    });

    if (!slip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(slip, { status: 200 });
  } catch (error) {
    console.error("Permission slip GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permission slip" },
      { status: 500 },
    );
  }
}
