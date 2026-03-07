export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { slipSchema } from "@/lib/formValidationSchemas";
import { generatePermissionSlipPDF } from "@/lib/pdf/permissionSlipPdf";
import { getMessageContent } from "@/lib/utils/messageUtils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const school = await db.schoolInfo.findUnique({
      where: { id: schoolId },
      select: { name: true },
    });

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const data = slipSchema.parse(body);

    const student = await db.student.findFirst({
      where: { id: data.studentId, schoolId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              include: {
                Grade: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in this school" },
        { status: 404 }
      );
    }

    const enrollment = student.enrollments[0];
    const classInfo = enrollment?.class;

    const leaveDate = data.date ? new Date(data.date) : new Date();

    const newSlip = await db.permissionSlip.create({
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

    const className = classInfo
      ? `${classInfo.Grade?.level ?? ""} - ${classInfo.section ?? ""}`
      : "";

    const messageText = getMessageContent("PERMISSION_SLIP", {
      studentName: student.name,
      className,
      schoolName: school.name,
      date: leaveDate,
      leaveType: newSlip.leaveType,
      withWhom: newSlip.withWhom || undefined,
      relation: newSlip.relation || undefined,
    });

    await db.messages.create({
      data: {
        schoolId,
        studentId: student.id,
        classId: classInfo?.id,
        message: messageText,
        type: "PERMISSION_SLIP",
        date: leaveDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newSlip,
        gateSlipPdf: `data:application/pdf;base64,${pdfBase64}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Permission slip POST error:", error);

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create permission slip" },
      { status: 500 }
    );
  }
}

/* ======================================================
   GET → Fetch Single Permission Slip
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const slip = await db.permissionSlip.findFirst({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!slip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slip);
  } catch (error) {
    console.error("Permission slip GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch permission slip" },
      { status: 500 }
    );
  }
}