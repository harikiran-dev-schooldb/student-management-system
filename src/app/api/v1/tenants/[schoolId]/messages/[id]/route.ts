export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id: messageId } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const body = await req.json();
    const { message, type, studentId, classId, gradeId, date } = body;

    if (!message || !type) {
      return NextResponse.json(
        { error: "message and type are required" },
        { status: 400 }
      );
    }

    const existing = await db.messages.findFirst({
      where: { id: messageId, schoolId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const targets = [studentId, classId, gradeId].filter(Boolean);
    if (targets.length > 1) {
      return NextResponse.json(
        { error: "Provide only one target: studentId, classId, or gradeId" },
        { status: 400 }
      );
    }

    const updatedDate = date ? new Date(date) : new Date();

    /* ==============================
       STUDENT TARGET
    ============================== */

    if (studentId) {
      const enrollment = await db.studentEnrollment.findFirst({
        where: {
          studentId,
          schoolId,
          status: "ACTIVE",
        },
        select: { classId: true },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "Student enrollment not found" },
          { status: 404 }
        );
      }

      const updated = await db.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          studentId,
          classId: enrollment.classId,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    /* ==============================
       CLASS TARGET
    ============================== */

    if (classId) {
      const cls = await db.class.findFirst({
        where: {
          id: Number(classId),
          schoolId,
        },
      });

      if (!cls) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        );
      }

      const updated = await db.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          classId: Number(classId),
          studentId: null,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    /* ==============================
       GRADE TARGET
    ============================== */

    if (gradeId) {
      const classes = await db.class.findMany({
        where: {
          gradeId: Number(gradeId),
          schoolId,
        },
        select: { id: true },
      });

      if (!classes.length) {
        return NextResponse.json(
          { error: "No classes found for this grade" },
          { status: 404 }
        );
      }

      const updated = await db.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          classId: classes[0].id,
          studentId: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Message re-targeted to grade classes",
        data: updated,
      });
    }

    /* ==============================
       SCHOOL WIDE
    ============================== */

    const updated = await db.messages.update({
      where: { id: messageId },
      data: {
        message,
        type,
        date: updatedDate,
        studentId: null,
        classId: null,
      },
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error("Message PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id: messageId } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const existing = await db.messages.findFirst({
      where: {
        id: messageId,
        schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    await db.messages.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("Message DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}