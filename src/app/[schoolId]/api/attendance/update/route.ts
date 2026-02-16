import prisma from "@/lib/prisma";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { NextResponse } from "next/server";
import { MessageType } from "../../../../../../types";

export async function PUT(
  req: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;

  const { attendanceId, present } = await req.json();

  if (!attendanceId || present === undefined) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    // ✅ Tenant-safe fetch
    const existing = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // ✅ If absent → present, remove absent message
    if (existing.present === false && present === true) {
      await prisma.messages.deleteMany({
        where: {
          studentId: existing.studentId,
          date: existing.date,
          type: "ABSENT",
          schoolId, // ✅ required
        },
      });
    }

    // ✅ If present → absent, create absent message
    if (existing.present === true && present === false) {
      const student = await prisma.student.findFirst({
        where: {
          id: existing.studentId,
          schoolId, // ✅ tenant safe
        },
        select: {
          name: true,
          Class: {
            select: {
              name: true,
            },
          },
        },
      });

      if (student) {
        const message = getMessageContent("ABSENT" as MessageType, {
          name: student.name,
          className: student.Class?.name ?? "Unknown",
        });

        await prisma.messages.create({
          data: {
            message,
            type: "ABSENT",
            date: existing.date, // ✅ keep Date type
            classId: existing.classId,
            studentId: existing.studentId,
            schoolId, // ✅ REQUIRED FIX
          },
        });
      }
    }

    // ✅ Update attendance tenant-safe
    const result = await prisma.attendance.updateMany({
      where: {
        id: attendanceId,
        schoolId, // 🔒 REQUIRED
      },
      data: { present },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Attendance update error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 },
    );
  }
}
