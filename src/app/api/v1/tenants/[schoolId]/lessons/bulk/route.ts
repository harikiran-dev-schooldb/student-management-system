import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { lessonsSchema } from "@/lib/formValidationSchemas";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { z } from "zod";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(
      context.params.schoolId
    );

    const user = await fetchUserInfo(schoolId);

    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can bulk upload timetable" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const lessons = body.lessons;

    if (!Array.isArray(lessons) || !lessons.length) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const validatedLessons: any[] = [];

    /* -------- Validate All Rows First -------- */
    for (let i = 0; i < lessons.length; i++) {
      const parsed = lessonsSchema.safeParse(lessons[i]);

      if (!parsed.success) {
        errors.push(
          `Row ${i + 2}: ${parsed.error.errors
            .map(e => e.message)
            .join(", ")}`
        );
        continue;
      }

      validatedLessons.push(parsed.data);
    }

    if (errors.length) {
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {

      for (const lesson of validatedLessons) {

        const periodKey =
          lesson.period as keyof typeof PERIOD_TIMINGS;

        const timing = PERIOD_TIMINGS[periodKey];

        if (!timing) {
          throw new Error(`Invalid period ${lesson.period}`);
        }

        const toTime = (timeStr: string) => {
          const [h, m] = timeStr.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          return d;
        };

        const startTime = toTime(timing.start);
        const endTime = toTime(timing.end);

        /* ---- Validate Class ---- */
        const cls = await tx.class.findFirst({
          where: { id: lesson.classId, schoolId },
        });

        if (!cls) {
          throw new Error(
            `Invalid class ${lesson.classId}`
          );
        }

        /* ---- Validate Subject ---- */
        const subject = await tx.subject.findFirst({
          where: {
            id: lesson.subjectId,
            schoolId,
          },
        });

        if (!subject) {
          throw new Error(
            `Invalid subject ${lesson.subjectId}`
          );
        }

        /* ---- Teacher Conflict Check ---- */
        if (lesson.teacherId) {
          const conflict = await tx.lesson.findFirst({
            where: {
              teacherId: lesson.teacherId,
              day: lesson.day,
              period: periodKey,
              schoolId,
            },
          });

          if (conflict) {
            throw new Error(
              `Teacher conflict for period ${lesson.period} on ${lesson.day}`
            );
          }
        }

        /* ---- Remove existing class slot ---- */
        await tx.lesson.deleteMany({
          where: {
            classId: lesson.classId,
            day: lesson.day,
            period: periodKey,
            schoolId,
          },
        });

        /* ---- Create lesson ---- */
        await tx.lesson.create({
          data: {
            title: subject.name,
            day: lesson.day,
            period: periodKey,
            startTime,
            endTime,
            subjectId: lesson.subjectId,
            classId: lesson.classId,
            teacherId: lesson.teacherId,
            schoolId,
          },
        });
      }
    });

    return NextResponse.json({
      message: "Bulk timetable upload successful",
      count: validatedLessons.length,
    });

  } catch (error: any) {
    console.error("Bulk lesson upload error:", error);

    return NextResponse.json(
      { error: error.message || "Bulk upload failed" },
      { status: 400 }
    );
  }
}