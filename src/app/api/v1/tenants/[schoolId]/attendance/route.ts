export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";
import { MessageType, Prisma } from "@prisma/client";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { SingleStudentSelect } from "../../../../../../../types/query-types";

/* =======================================================
   POST  /attendance  (Bulk Upsert)
======================================================= */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* ================================
       Resolve Tenant
    ================================= */

    const { schoolId: slug } = await params;
    const resolvedSchoolId = await resolveSchoolId(slug);
    const access = await requireTenantAccess();

    if (
      access.schoolId !== resolvedSchoolId ||
      !["admin", "teacher"].includes(access.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    /* ================================
       Parse Payload
    ================================= */

    const payload = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty payload" },
        { status: 400 },
      );
    }

    if (
      !payload.every(
        (p) =>
          p.studentId &&
          p.classId &&
          typeof p.present === "boolean" &&
          p.date,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 },
      );
    }

    /* ================================
       Normalize Date
    ================================= */

    const rawDate = new Date(payload[0].date);

    if (Number.isNaN(rawDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const dateOnly = new Date(
      Date.UTC(
        rawDate.getUTCFullYear(),
        rawDate.getUTCMonth(),
        rawDate.getUTCDate(),
      ),
    );

    /* ================================
       Validate Classes
    ================================= */

    const classIds = [...new Set(payload.map((e) => e.classId))];

    const validClasses = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        schoolId,
      },
      select: { id: true },
    });

    if (validClasses.length !== classIds.length) {
      return NextResponse.json(
        { error: "Invalid class for this school" },
        { status: 400 },
      );
    }

    /* ================================
       Validate Students
    ================================= */

    const studentIds = [...new Set(payload.map((e) => e.studentId))];

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
      select: SingleStudentSelect,
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Invalid student for this school" },
        { status: 400 },
      );
    }

    const studentMap = new Map(students.map((s) => [s.id, s]));

    for (const entry of payload) {
      const student = studentMap.get(entry.studentId);

      const enrollment = student?.enrollments?.find(
        (e) => e.class.id === entry.classId,
      );

      if (!student || !enrollment) {
        return NextResponse.json(
          { error: "Student does not belong to provided class" },
          { status: 400 },
        );
      }
    }

    /* ================================
       Database Transaction
    ================================= */

    await prisma.$transaction(async (tx) => {
      /* ---------- Active Academic Year ---------- */

      const activeYear = await tx.academicYear.findFirst({
        where: {
          schoolId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!activeYear) {
        throw new Error("No active academic year");
      }

      const academicYearId = activeYear.id;

      /* ---------- Prepare Attendance Data ---------- */

      const attendanceData = payload.map((entry) => ({
        studentId: entry.studentId,
        classId: entry.classId,
        present: entry.present,
        date: dateOnly,
        schoolId,
        academicYearId,
      }));

      /* ---------- Upsert Attendance ---------- */

      await Promise.all(
        attendanceData.map((data) =>
          tx.attendance.upsert({
            where: {
              studentId_date_academicYearId_schoolId: {
                studentId: data.studentId,
                date: data.date,
                academicYearId: data.academicYearId,
                schoolId: data.schoolId,
              },
            },
            update: {
              present: data.present,
            },
            create: data,
          }),
        ),
      );

      /* ---------- Split Present / Absent ---------- */

      const absentStudents = attendanceData.filter((a) => !a.present);
      const presentStudents = attendanceData.filter((a) => a.present);

      /* ---------- School Info ---------- */

      const school = await tx.schoolInfo.findUnique({
        where: { id: schoolId },
        select: { name: true },
      });

      const schoolName = school?.name ?? "School";

      /* ---------- Create Absent Messages ---------- */

      if (absentStudents.length > 0) {
        const messages = absentStudents.map((entry) => {
          const student = studentMap.get(entry.studentId);

          const enrollment = student?.enrollments?.[0];
          const className = enrollment?.class?.name ?? null;

          return {
            message: getMessageContent("ABSENT", {
              studentName: student?.name ?? "",
              className,
              schoolName,
              date: dateOnly,
            }),
            type: MessageType.ABSENT,
            date: dateOnly,
            studentId: entry.studentId,
            classId: entry.classId,
            schoolId,
          };
        });

        await tx.messages.createMany({
          data: messages,
          skipDuplicates: true,
        });
      }

      /* ---------- Remove Messages for Present ---------- */

      if (presentStudents.length > 0) {
        await tx.messages.deleteMany({
          where: {
            studentId: {
              in: presentStudents.map((p) => p.studentId),
            },
            date: dateOnly,
            type: "ABSENT",
            schoolId,
          },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Attendance POST error:", error);

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 },
    );
  }
}

/* =======================================================
   GET  /attendance
======================================================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* ================================
       Resolve Tenant
    ================================= */

    const { schoolId: slug } = await params;
    const access = await requireTenantAccess();

    if (access.schoolSlug !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    /* ================================
       Query Params
    ================================= */

    const { searchParams } = new URL(req.url);

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const classIdParam = searchParams.get("classId");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Provide start and end date" },
        { status: 400 },
      );
    }

    const start = new Date(`${startParam}T00:00:00.000Z`);
    const end = new Date(`${endParam}T23:59:59.999Z`);

    /* ================================
       Attendance Filter
    ================================= */

    const where: Prisma.AttendanceWhereInput = {
      schoolId,
      date: {
        gte: start,
        lte: end,
      },
    };

    /* ================================
       Role Restrictions
    ================================= */

    if (access.role === "teacher") {
      where.classId = access.classId ?? undefined;
    }

    if (access.role === "admin") {
      if (classIdParam) {
        where.classId = Number(classIdParam);
      }
    }

    if (access.role === "student") {
      where.studentId = access.studentId ?? undefined;
    }

    /* ================================
       Fetch Attendance
    ================================= */

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    if (attendance.length === 0) {
      return NextResponse.json({
        attendance: [],
        students: [],
      });
    }

    /* ================================
       Fetch Students
    ================================= */

    const studentIds = [...new Set(attendance.map((a) => a.studentId))];

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
      select: {
        id: true,
        name: true,

        enrollments: {
          where: {
            status: "ACTIVE",
          },
          select: {
            class: {
              select: {
                id: true,
                name: true,
                section: true,
                Grade: {
                  select: {
                    level: true,
                  },
                },
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
  } catch (error) {
    console.error("Attendance GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
