import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const classId = searchParams.get("classId");
  const gradeId = searchParams.get("gradeId");

  if (!from || !to) {
    return NextResponse.json(
      { error: "From and To dates are required" },
      { status: 400 }
    );
  }

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  // --------------------------------------------
  // Attendance filter
  // --------------------------------------------
  const attendanceWhere: any = {
    date: { gte: start, lte: end },
  };

  if (classId) {
    attendanceWhere.classId = Number(classId);
  } else if (gradeId) {
    const classIds = await prisma.class.findMany({
      where: { gradeId: Number(gradeId) },
      select: { id: true },
    });

    attendanceWhere.classId = {
      in: classIds.map((c) => c.id),
    };
  }

  // --------------------------------------------
  // Attendance records
  // --------------------------------------------
  const attendance = await prisma.attendance.findMany({
    where: attendanceWhere,
    orderBy: { date: "desc" },
  });

  // --------------------------------------------
  // Students (SELECT only what UI needs)
  // --------------------------------------------
  const studentIds = [...new Set(attendance.map((a) => a.studentId))];

  const students = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      Class: {
        select: {
          id: true,
          section: true,
          Grade: {
            select: {
              level: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    attendance,
    students,
  });
}
