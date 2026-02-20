import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";

/* ======================================================
   PUT  → Update Message (Tenant Safe)
====================================================== */
export async function PUT(
  req: NextRequest,
  context: { params: { schoolId: string; id: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);
    const messageId = context.params.id;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { message, type, studentId, classId, gradeId, date } = body;

    if (!message || !type) {
      return NextResponse.json(
        { error: "message and type are required" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------
       Ensure Message Belongs to This School
    ----------------------------------------------------- */
    const existingMessage = await prisma.messages.findFirst({
      where: { id: messageId, schoolId },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Message not found in this school" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------
       Prevent Conflicting Targeting
    ----------------------------------------------------- */
    const targets = [studentId, classId, gradeId].filter(Boolean);
    if (targets.length > 1) {
      return NextResponse.json(
        { error: "Provide only one of studentId, classId, or gradeId" },
        { status: 400 }
      );
    }

    const updatedDate = date ? new Date(date) : new Date();

    /* -----------------------------
       1️⃣ Student Target
    ------------------------------ */
    if (studentId) {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId },
        select: { id: true, classId: true },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found in this school" },
          { status: 404 }
        );
      }

      const updatedMessage = await prisma.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          studentId,
          classId: student.classId,
        },
      });

      return NextResponse.json(
        { success: true, data: updatedMessage },
        { status: 200 }
      );
    }

    /* -----------------------------
       2️⃣ Class Target
    ------------------------------ */
    if (classId) {
      const cls = await prisma.class.findFirst({
        where: { id: Number(classId), schoolId },
      });

      if (!cls) {
        return NextResponse.json(
          { error: "Class not found in this school" },
          { status: 404 }
        );
      }

      const updatedMessage = await prisma.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          classId: Number(classId),
          studentId: null,
        },
      });

      return NextResponse.json(
        { success: true, data: updatedMessage },
        { status: 200 }
      );
    }

    /* -----------------------------
       3️⃣ Grade Target
       (Re-target to all classes in grade)
    ------------------------------ */
    if (gradeId) {
      const classes = await prisma.class.findMany({
        where: { gradeId: Number(gradeId), schoolId },
        select: { id: true },
      });

      if (!classes.length) {
        return NextResponse.json(
          { error: "No classes found for this grade" },
          { status: 404 }
        );
      }

      // Update current message to first class
      const updatedMessage = await prisma.messages.update({
        where: { id: messageId },
        data: {
          message,
          type,
          date: updatedDate,
          classId: classes[0].id,
          studentId: null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Message updated and re-targeted to grade`,
          data: updatedMessage,
        },
        { status: 200 }
      );
    }

    /* -----------------------------
       4️⃣ School-wide
    ------------------------------ */
    const updatedMessage = await prisma.messages.update({
      where: { id: messageId },
      data: {
        message,
        type,
        date: updatedDate,
        studentId: null,
        classId: null,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Message PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}