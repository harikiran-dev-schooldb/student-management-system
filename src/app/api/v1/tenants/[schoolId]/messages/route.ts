export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { messaging } from "@/lib/firebase-admin";

// ✅ ADD THIS FUNCTION HERE
async function sendPush(tokens: string[], title: string, body: string) {
  if (!tokens.length) return;

  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    if (!["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    const db = tenantPrisma(schoolId);

    const body = await req.json();
    const { message, type, studentId, classId, gradeId } = body;

    if (!message || !type) {
      return NextResponse.json(
        { error: "message and type are required" },
        { status: 400 },
      );
    }

    const targets = [studentId, classId, gradeId].filter(Boolean);
    if (targets.length > 1) {
      return NextResponse.json(
        { error: "Provide only one of studentId, classId, gradeId" },
        { status: 400 },
      );
    }

    const now = new Date();

    /* =========================
       STUDENT MESSAGE
    ========================= */

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
          { status: 404 },
        );
      }

      const newMessage = await db.messages.create({
        data: {
          message,
          type,
          date: now,
          studentId,
          classId: enrollment.classId,
          schoolId,
        },
      });

      const tokens = await db.deviceToken.findMany({
        where: {
          userId: studentId,
          schoolId,
        },
        select: { token: true },
      });

      await sendPush(
        tokens.map(t => t.token),
        "New Message",
        message
      );

      return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
    }

    /* =========================
       CLASS MESSAGE
    ========================= */

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
          { status: 404 },
        );
      }

      const newMessage = await db.messages.create({
        data: {
          message,
          type,
          date: now,
          classId: Number(classId),
          schoolId,
        },
      });

      const students = await db.studentEnrollment.findMany({
        where: {
          classId: Number(classId),
          schoolId,
          status: "ACTIVE",
        },
        select: { studentId: true },
      });

      const tokens = await db.deviceToken.findMany({
        where: {
          userId: { in: students.map(s => s.studentId) },
          schoolId,
        },
        select: { token: true },
      });

      await sendPush(tokens.map(t => t.token), "Class Update", message);

      return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
    }

    /* =========================
       GRADE MESSAGE
    ========================= */

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
          { status: 404 },
        );
      }

      await db.messages.createMany({
        data: classes.map((cls) => ({
          message,
          type,
          date: now,
          classId: cls.id,
          schoolId,
        })),
      });

      const students = await db.studentEnrollment.findMany({
        where: {
          schoolId,
          status: "ACTIVE",
          class: {
            gradeId: Number(gradeId),
          },
        },
        select: { studentId: true },
      });

      const tokens = await db.deviceToken.findMany({
        where: {
          userId: { in: students.map(s => s.studentId) },
          schoolId,
        },
        select: { token: true },
      });

      await sendPush(tokens.map(t => t.token), "Grade Update", message);

      return NextResponse.json(
        {
          success: true,
          message: `Message sent to ${classes.length} classes`,
        },
        { status: 201 },
      );
    }

    /* =========================
       SCHOOL WIDE MESSAGE
    ========================= */

    const newMessage = await db.messages.create({
      data: {
        message,
        type,
        date: now,
        schoolId,
      },
    });

    await messaging.send({
      topic: `school_${schoolId}`,
      notification: {
        title: "School Announcement",
        body: message,
      },
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });

  } catch (error) {
    console.error("Message POST error:", error);

    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}

/* ======================================================
   GET  → Fetch Messages (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    if (!["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    const db = tenantPrisma(schoolId);

    const messages = await db.messages.findMany({
      where: { schoolId },
      orderBy: { date: "desc" },
      include: {
        Student: {
          select: { id: true, name: true },
        },
        Class: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error("Message GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}