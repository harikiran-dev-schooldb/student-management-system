export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { StaffAttendanceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const statusValues = Object.values(StaffAttendanceStatus);

function parseOptionalTime(date: Date, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id } = await params;
    const { access, error } = await tenantSlugGuard(slug);

    if (error) return error;

    if (!["admin", "teacher"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.staffAttendance.findFirst({
      where: {
        id: parsedId,
        schoolId: access.schoolId,
        ...(access.role === "teacher" ? { teacherId: access.teacherId } : {}),
      },
      select: {
        id: true,
        date: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const body = await req.json();
    const data: {
      status?: StaffAttendanceStatus;
      checkIn?: Date | null;
      checkOut?: Date | null;
      remarks?: string | null;
    } = {};

    if (body.status) {
      if (!statusValues.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid staff attendance status" },
          { status: 400 },
        );
      }

      data.status = body.status;
    }

    if ("checkIn" in body) {
      data.checkIn = body.checkIn
        ? parseOptionalTime(existing.date, body.checkIn) ?? null
        : null;
    }

    if ("checkOut" in body) {
      data.checkOut = body.checkOut
        ? parseOptionalTime(existing.date, body.checkOut) ?? null
        : null;
    }

    if ("remarks" in body) {
      data.remarks =
        typeof body.remarks === "string" && body.remarks.trim()
          ? body.remarks.trim()
          : null;
    }

    const attendance = await prisma.staffAttendance.update({
      where: { id: parsedId },
      data,
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
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("Staff attendance PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update staff attendance" },
      { status: 500 },
    );
  }
}
