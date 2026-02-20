import prisma from "@/lib/prisma";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";
import { MessageType } from "../../../../../../../types";
import { Prisma } from "@prisma/client";

/* =======================================================
   POST  /attendance  (Bulk Upsert)
======================================================= */

export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const { schoolId: slug } = context.params;
    const access = await requireTenantAccess();

    /* 🔐 Tenant + RBAC */
    if (access.schoolId !== slug || !["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;
    const payload = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty payload" },
        { status: 400 }
      );
    }

    /* ---------- Normalize Date (UTC Safe) ---------- */
    const rawDate = new Date(payload[0].date);
    if (Number.isNaN(rawDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const dateOnly = new Date(
      Date.UTC(
        rawDate.getUTCFullYear(),
        rawDate.getUTCMonth(),
        rawDate.getUTCDate()
      )
    );

    /* ---------- Validate Classes ---------- */
    const classIds = [...new Set(payload.map(e => e.classId))];

    const validClasses = await prisma.class.findMany({
      where: { id: { in: classIds }, schoolId },
      select: { id: true },
    });

    if (validClasses.length !== classIds.length) {
      return NextResponse.json(
        { error: "Invalid class for this school" },
        { status: 400 }
      );
    }

    /* ---------- Validate Students ---------- */
    const studentIds = [...new Set(payload.map(e => e.studentId))];

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds }, schoolId },
      select: {
        id: true,
        name: true,
        classId: true,
        Class: { select: { name: true } },
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Invalid student for this school" },
        { status: 400 }
      );
    }

    const studentMap = new Map(students.map(s => [s.id, s]));

    for (const entry of payload) {
      const student = studentMap.get(entry.studentId);
      if (!student || student.classId !== entry.classId) {
        return NextResponse.json(
          { error: "Student does not belong to provided class" },
          { status: 400 }
        );
      }
    }

    /* ---------------- TRANSACTION ---------------- */

    await prisma.$transaction(async (tx) => {
      for (const entry of payload) {
        await tx.attendance.upsert({
          where: {
            studentId_date_schoolId: {
              studentId: entry.studentId,
              date: dateOnly,
              schoolId,
            },
          },
          update: { present: entry.present },
          create: {
            studentId: entry.studentId,
            classId: entry.classId,
            date: dateOnly,
            present: entry.present,
            schoolId,
          },
        });

        const student = studentMap.get(entry.studentId);
        if (!student) continue;

        if (entry.present === false) {
          const existingMessage = await tx.messages.findFirst({
            where: {
              studentId: entry.studentId,
              date: dateOnly,
              type: "ABSENT",
              schoolId,
            },
            select: { id: true },
          });

          if (!existingMessage) {
            await tx.messages.create({
              data: {
                message: getMessageContent("ABSENT" as MessageType, {
                  name: student.name,
                  className: student.Class?.name ?? "Unknown",
                }),
                type: "ABSENT",
                date: dateOnly,
                studentId: entry.studentId,
                classId: entry.classId,
                schoolId,
              },
            });
          }
        } else {
          await tx.messages.deleteMany({
            where: {
              studentId: entry.studentId,
              date: dateOnly,
              type: "ABSENT",
              schoolId,
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

/* =======================================================
   GET  /attendance
======================================================= */

export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const { schoolId: slug } = context.params;
    const access = await requireTenantAccess();

    if (access.schoolId !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;
    const { searchParams } = new URL(req.url);

    const dateParam = searchParams.get("date");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const classIdParam = searchParams.get("classId");
    const studentIdParam = searchParams.get("studentId");

    const where: Prisma.AttendanceWhereInput = { schoolId };

    /* ---------- Filters ---------- */

    if (studentIdParam) {
      where.studentId = studentIdParam;
    }

    if (classIdParam) {
      const parsedClassId = Number(classIdParam);
      if (Number.isNaN(parsedClassId)) {
        return NextResponse.json(
          { error: "Invalid classId" },
          { status: 400 }
        );
      }
      where.classId = parsedClassId;
    }

    if (dateParam) {
      const date = new Date(`${dateParam}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid date" },
          { status: 400 }
        );
      }
      where.date = date;
    } else if (startParam && endParam) {
      const start = new Date(`${startParam}T00:00:00.000Z`);
      const end = new Date(`${endParam}T00:00:00.000Z`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid date range" },
          { status: 400 }
        );
      }

      where.date = { gte: start, lte: end };
    }

    if (!studentIdParam && !classIdParam) {
      return NextResponse.json(
        { error: "Provide studentId or classId" },
        { status: 400 }
      );
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        studentId: true,
        classId: true,
        present: true,
      },
    });

    return NextResponse.json({ success: true, records });

  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
