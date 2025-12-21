// app/api/lessons/bulk/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { lessonsSchema } from "@/lib/formValidationSchemas";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lessons = body.lessons;

    if (!Array.isArray(lessons)) {
      return NextResponse.json(
        { message: "Invalid payload. Expected { lessons: [] }" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let successCount = 0;

    // helper: "HH:mm" → Date
    function timeStringToDate(timeStr: string): Date {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    for (let i = 0; i < lessons.length; i++) {
      const row = lessons[i];

      // ✅ Validate row (NO startTime / endTime here)
      const parsed = lessonsSchema.safeParse(row);
      if (!parsed.success) {
        errors.push(
          `Row ${i + 2}: ${parsed.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
        continue;
      }

      const validated = parsed.data;

      // ✅ Resolve period timings
      const periodKey = validated.period as keyof typeof PERIOD_TIMINGS;
      const timing = PERIOD_TIMINGS[periodKey];
      if (!timing) {
        errors.push(`Row ${i + 2}: Invalid period`);
        continue;
      }

      const startTime = timeStringToDate(timing.start);
      const endTime = timeStringToDate(timing.end);

      // ✅ Ensure subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: validated.subjectId },
      });
      if (!subject) {
        errors.push(`Row ${i + 2}: Subject not found`);
        continue;
      }

      // ✅ Delete existing lesson for same slot
      await prisma.lesson.deleteMany({
        where: {
          classId: validated.classId,
          day: validated.day,
          period: periodKey,
        },
      });

      // ✅ Create lesson with derived timings
      await prisma.lesson.create({
        data: {
          title: subject.name,
          day: validated.day,
          period: periodKey,
          startTime,
          endTime,
          subjectId: validated.subjectId,
          classId: validated.classId,
          teacherId: validated.teacherId,
        },
      });

      successCount++;
    }

    return NextResponse.json({
      message: `Bulk upload complete: ${successCount} lessons created.`,
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Bulk lesson upload error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
