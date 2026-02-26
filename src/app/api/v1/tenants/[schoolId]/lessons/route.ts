export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { lessonsSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const body = await req.json();
    const validated = lessonsSchema.parse(body);

    const periodKey = validated.period as keyof typeof PERIOD_TIMINGS;
    const periodTiming = PERIOD_TIMINGS[periodKey];

    if (!periodTiming) {
      return NextResponse.json({ message: "Invalid period" }, { status: 400 });
    }

    // 🔥 STEP 1: Find school by slug
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 },
      );
    }

    function timeStringToDate(timeStr: string): Date {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    const startTime = timeStringToDate(periodTiming.start);
    const endTime = timeStringToDate(periodTiming.end);

    /* -----------------------------
       Tenant-safe subject check
    ------------------------------ */
    const subject = await prisma.subject.findFirst({
      where: {
        id: validated.subjectId,
        schoolId: school.id,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 },
      );
    }

    /* -----------------------------
       Tenant-safe delete
    ------------------------------ */
    await prisma.lesson.deleteMany({
      where: {
        classId: validated.classId,
        day: validated.day,
        period: periodKey,
        schoolId: school.id, // ✅ REQUIRED
      },
    });

    /* -----------------------------
       Create lesson (with schoolId)
    ------------------------------ */
    const lesson = await prisma.lesson.create({
      data: {
        title: subject.name,
        day: validated.day,
        period: periodKey,
        startTime,
        endTime,
        subjectId: validated.subjectId,
        classId: validated.classId,
        teacherId: validated.teacherId,
        schoolId: school.id,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 },
      );
    }

    console.error("Lesson creation error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ===================================================
   GET → Fetch Timetable
   ?classId=1
   ?teacherId=abc123
   ?day=MONDAY
=================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(schoolId);
    if (!user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const classIdParam = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const day = searchParams.get("day");

    if (!classIdParam && !teacherId) {
      return NextResponse.json(
        { error: "Provide classId or teacherId" },
        { status: 400 },
      );
    }

    const where: any = { schoolId };

    /* ---------------- Class Filter ---------------- */
    if (classIdParam) {
      const classId = Number(classIdParam);
      if (isNaN(classId)) {
        return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
      }

      where.classId = classId;
    }

    /* ---------------- Teacher Filter ---------------- */
    if (teacherId) {
      where.teacherId = teacherId;
    }

    /* ---------------- Day Filter ---------------- */
    if (day) {
      where.day = day;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [{ day: "asc" }, { period: "asc" }],
      include: {
        Subject: {
          select: { id: true, name: true },
        },
        Class: {
          select: { id: true, name: true },
        },
        Teacher: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Lesson GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 },
    );
  }
}
