export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* ======================================================
   POST  → Create Message
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const resolvedSchoolId = await resolveSchoolId(slug);
    const access = await requireTenantAccess();

    if (
      access.schoolId !== resolvedSchoolId ||
      !["admin", "teacher"].includes(access.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = resolvedSchoolId;

    const body = await req.json();
    const { message, type, studentId, classId, gradeId } = body;

    if (!message || !type) {
      return NextResponse.json(
        { error: "message and type are required" },
        { status: 400 },
      );
    }

    // Prevent conflicting targeting
    const targets = [studentId, classId, gradeId].filter(Boolean);
    if (targets.length > 1) {
      return NextResponse.json(
        { error: "Provide only one of studentId, classId, or gradeId" },
        { status: 400 },
      );
    }

    const now = new Date();

    /* -----------------------------
       1️⃣ Student Message
    ------------------------------ */
    if (studentId) {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId },
        select: { id: true, classId: true },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found in this school" },
          { status: 404 },
        );
      }

      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: now,
          studentId,
          classId: student.classId,
          schoolId,
        },
      });

      return NextResponse.json(
        { success: true, data: newMessage },
        { status: 201 },
      );
    }

    /* -----------------------------
       2️⃣ Class Message
    ------------------------------ */
    if (classId) {
      const cls = await prisma.class.findFirst({
        where: { id: Number(classId), schoolId },
      });

      if (!cls) {
        return NextResponse.json(
          { error: "Class not found in this school" },
          { status: 404 },
        );
      }

      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: now,
          classId: Number(classId),
          schoolId,
        },
      });

      return NextResponse.json(
        { success: true, data: newMessage },
        { status: 201 },
      );
    }

    /* -----------------------------
       3️⃣ Grade Message
    ------------------------------ */
    if (gradeId) {
      const classes = await prisma.class.findMany({
        where: { gradeId: Number(gradeId), schoolId },
        select: { id: true },
      });

      if (!classes.length) {
        return NextResponse.json(
          { error: "No classes found for this grade" },
          { status: 404 },
        );
      }

      await prisma.messages.createMany({
        data: classes.map((cls) => ({
          message,
          type,
          date: now,
          classId: cls.id,
          schoolId,
        })),
      });

      return NextResponse.json(
        {
          success: true,
          message: `Message sent to ${classes.length} classes`,
        },
        { status: 201 },
      );
    }

    /* -----------------------------
       4️⃣ School-wide
    ------------------------------ */
    const newMessage = await prisma.messages.create({
      data: {
        message,
        type,
        date: now,
        schoolId,
      },
    });

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201 },
    );
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
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const messages = await prisma.messages.findMany({
      where: { schoolId },
      orderBy: { date: "desc" },
      include: {
        Student: { select: { id: true, name: true } },
        Class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Message GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
