import { lessonsSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const body = await req.json();
    const validated = lessonsSchema.parse(body);

    const periodKey = validated.period as keyof typeof PERIOD_TIMINGS;
    const periodTiming = PERIOD_TIMINGS[periodKey];

    if (!periodTiming) {
      return NextResponse.json({ message: "Invalid period" }, { status: 400 });
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
        schoolId,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
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
        schoolId,
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
        schoolId, // ✅ REQUIRED
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Lesson creation error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
