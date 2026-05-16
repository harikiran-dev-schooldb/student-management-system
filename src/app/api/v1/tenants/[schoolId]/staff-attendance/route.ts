export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { Prisma, StaffAttendanceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const statusValues = Object.values(StaffAttendanceStatus);

function toDateOnly(value: string) {
  const rawDate = new Date(value);

  if (Number.isNaN(rawDate.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      rawDate.getUTCFullYear(),
      rawDate.getUTCMonth(),
      rawDate.getUTCDate(),
    ),
  );
}

function parseOptionalTime(date: Date, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
    ),
  );
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

    const payload = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty payload" },
        { status: 400 },
      );
    }

    const dates = [...new Set(payload.map((entry) => entry.date))];

    if (dates.length !== 1) {
      return NextResponse.json(
        { error: "All staff attendance entries must have the same date" },
        { status: 400 },
      );
    }

    const dateOnly = toDateOnly(dates[0]);

    if (!dateOnly) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const teacherIds = [...new Set(payload.map((entry) => entry.teacherId))];

    if (
      teacherIds.some((teacherId) => typeof teacherId !== "string" || !teacherId)
    ) {
      return NextResponse.json(
        { error: "Missing teacherId in payload" },
        { status: 400 },
      );
    }

    if (access.role === "teacher") {
      if (!access.teacherId) {
        return NextResponse.json(
          { error: "Teacher access invalid" },
          { status: 400 },
        );
      }

      if (teacherIds.length !== 1 || teacherIds[0] !== access.teacherId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        schoolId: access.schoolId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (teachers.length !== teacherIds.length) {
      return NextResponse.json(
        { error: "Invalid staff member for this school" },
        { status: 400 },
      );
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: {
        schoolId: access.schoolId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 },
      );
    }

    const records = await prisma.$transaction(
      payload.map((entry) => {
        const status = entry.status as StaffAttendanceStatus;

        if (!statusValues.includes(status)) {
          throw new Error("Invalid staff attendance status");
        }

        const data = {
          date: dateOnly,
          status,
          checkIn: parseOptionalTime(dateOnly, entry.checkIn),
          checkOut: parseOptionalTime(dateOnly, entry.checkOut),
          remarks:
            typeof entry.remarks === "string" && entry.remarks.trim()
              ? entry.remarks.trim()
              : null,
          teacherId: entry.teacherId,
          schoolId: access.schoolId,
          academicYearId: activeYear.id,
        };

        return prisma.staffAttendance.upsert({
          where: {
            teacherId_date_academicYearId_schoolId: {
              teacherId: entry.teacherId,
              date: dateOnly,
              academicYearId: activeYear.id,
              schoolId: access.schoolId,
            },
          },
          create: data,
          update: data,
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                username: true,
                phone: true,
              },
            },
          },
        });
      }),
    );

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error("Staff attendance POST error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to save staff attendance" },
      { status: 500 },
    );
  }
}

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

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const teacherIdParam = searchParams.get("teacherId");
    const statusParam = searchParams.get("status");

    let start: Date;
    let end: Date;

    if (dateParam) {
      start = new Date(`${dateParam}T00:00:00.000Z`);
      end = new Date(`${dateParam}T23:59:59.999Z`);
    } else if (startParam && endParam) {
      start = new Date(`${startParam}T00:00:00.000Z`);
      end = new Date(`${endParam}T23:59:59.999Z`);
    } else {
      return NextResponse.json(
        { error: "Provide date OR start & end" },
        { status: 400 },
      );
    }

    const where: Prisma.StaffAttendanceWhereInput = {
      schoolId: access.schoolId,
      date: {
        gte: start,
        lte: end,
      },
    };

    if (access.role === "teacher") {
      if (!access.teacherId) {
        return NextResponse.json(
          { error: "Teacher access invalid" },
          { status: 400 },
        );
      }

      where.teacherId = access.teacherId;
    } else if (teacherIdParam) {
      where.teacherId = teacherIdParam;
    }

    if (
      statusParam &&
      statusValues.includes(statusParam as StaffAttendanceStatus)
    ) {
      where.status = statusParam as StaffAttendanceStatus;
    }

    const [attendance, teachers] = await prisma.$transaction([
      prisma.staffAttendance.findMany({
        where,
        orderBy: [{ date: "desc" }, { teacher: { name: "asc" } }],
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              username: true,
              phone: true,
              img: true,
            },
          },
        },
      }),
      prisma.teacher.findMany({
        where: {
          schoolId: access.schoolId,
          status: "ACTIVE",
          ...(access.role === "teacher" ? { id: access.teacherId } : {}),
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          username: true,
          phone: true,
          img: true,
        },
      }),
    ]);

    return NextResponse.json({ attendance, teachers });
  } catch (error) {
    console.error("Staff attendance GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
