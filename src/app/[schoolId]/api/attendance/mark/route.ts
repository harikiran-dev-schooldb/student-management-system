import prisma from "@/lib/prisma";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { MessageType } from "../../../../../../types";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const data = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty data" },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(data[0].date);
    const dateOnly = new Date(attendanceDate.toISOString().split("T")[0]);

    const presentIds: string[] = [];
    const absentIds: string[] = [];
    const createPayload: any[] = [];
    const studentClassMap = new Map<string, number>();

    for (const entry of data) {
      studentClassMap.set(entry.studentId, entry.classId);

      if (entry.present) presentIds.push(entry.studentId);
      else absentIds.push(entry.studentId);

      createPayload.push({
        studentId: entry.studentId,
        classId: entry.classId,
        date: dateOnly,
        present: entry.present,
        schoolId, // ✅ REQUIRED
      });
    }

    const existing = await prisma.attendance.findMany({
      where: {
        studentId: { in: [...presentIds, ...absentIds] },
        date: dateOnly,
        schoolId, // ✅ tenant safe
      },
      select: { studentId: true },
    });

    const existingIds = new Set(existing.map((e) => e.studentId));
    const toCreate = createPayload.filter((a) => !existingIds.has(a.studentId));

    const tx: Prisma.PrismaPromise<any>[] = [];

    tx.push(
      prisma.attendance.updateMany({
        where: { studentId: { in: presentIds }, date: dateOnly, schoolId },
        data: { present: true },
      })
    );

    tx.push(
      prisma.attendance.updateMany({
        where: { studentId: { in: absentIds }, date: dateOnly, schoolId },
        data: { present: false },
      })
    );

    if (toCreate.length > 0) {
      tx.push(
        prisma.attendance.createMany({
          data: toCreate,
          skipDuplicates: true,
        })
      );
    }

    await prisma.$transaction(tx);

    const absentStudents = await prisma.student.findMany({
      where: {
        id: { in: absentIds },
        status: "ACTIVE",
        schoolId, // ✅ tenant safe
      },
      select: {
        id: true,
        name: true,
        Class: { select: { name: true } },
      },
    });

    if (absentStudents.length > 0) {
      await prisma.messages.createMany({
        data: absentStudents.map((student) => ({
          message: getMessageContent("ABSENT" as MessageType, {
            name: student.name,
            className: student.Class?.name ?? "Unknown",
          }),
          type: "ABSENT",
          date: dateOnly,
          studentId: student.id,
          classId: studentClassMap.get(student.id)!,
          schoolId, // ✅ REQUIRED FIX
        })),
      });
    }

    return NextResponse.json({
      success: true,
      created: toCreate.length,
      present: presentIds.length,
      absent: absentIds.length,
    });
  } catch (error) {
    console.error("❌ Attendance error:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId } = await context.params;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const classId = searchParams.get("classId");

  if (!date || !classId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        date: new Date(date),
        classId: parseInt(classId),
        schoolId, // ✅ tenant filter
      },
      select: {
        studentId: true,
        present: true,
      },
    });

    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json(
      { error: "Error fetching data" },
      { status: 500 }
    );
  }
}
