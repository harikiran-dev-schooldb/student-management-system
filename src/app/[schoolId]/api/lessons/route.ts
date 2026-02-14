// app/api/lessons/route.ts

import { lessonsSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input (should include: day, period, subjectId, classId, teacherId)
    const validated = lessonsSchema.parse(body);

    // ✅ Check if provided period exists in PERIOD_TIMINGS
    const periodKey = validated.period as keyof typeof PERIOD_TIMINGS;
    const periodTiming = PERIOD_TIMINGS[periodKey];
    if (!periodTiming) {
      return NextResponse.json({ message: "Invalid period" }, { status: 400 });
    }

    // Convert "HH:mm" → Date objects
    function timeStringToDate(timeStr: string): Date {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    const startTime = timeStringToDate(periodTiming.start);
    const endTime = timeStringToDate(periodTiming.end);

    // ✅ Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: validated.subjectId },
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // ✅ Delete any existing lesson for same class, day, and period
    await prisma.lesson.deleteMany({
      where: {
        classId: validated.classId,
        day: validated.day,
        period: periodKey,
      },
    });

    // ✅ Create lesson with auto timings
    const lesson = await prisma.lesson.create({
      data: {
        title: subject.name,
        day: validated.day,
        period: periodKey, // save enum
        startTime,
        endTime,
        subjectId: validated.subjectId,
        classId: validated.classId,
        teacherId: validated.teacherId,
      },
    });

    console.log("Created lesson:", lesson);

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
