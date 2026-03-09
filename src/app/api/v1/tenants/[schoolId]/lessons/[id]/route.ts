export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { lessonsSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ===================================================
   PUT → Update Lesson
=================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> }
) {
  try {
    const { schoolId: slug, id: lessonIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(slug);

    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can update lessons" },
        { status: 403 }
      );
    }

    const lessonId = Number(lessonIdStr);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lesson ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = lessonsSchema.parse(body);

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        schoolId,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    /* -------- Validate Class -------- */
    const cls = await prisma.class.findFirst({
      where: {
        id: validated.classId,
        schoolId,
      },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Invalid class" },
        { status: 400 }
      );
    }

    /* -------- Validate Subject -------- */
    const subject = await prisma.subject.findFirst({
      where: {
        id: validated.subjectId,
        schoolId,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Invalid subject" },
        { status: 400 }
      );
    }

    /* -------- Teacher Conflict Check -------- */
    if (validated.teacherId) {
      const conflict = await prisma.lesson.findFirst({
        where: {
          teacherId: validated.teacherId,
          day: validated.day,
          period: validated.period,
          schoolId,
          NOT: { id: lessonId },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "Teacher already assigned this period" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: subject.name,
        day: validated.day,
        period: validated.period,
        subjectId: validated.subjectId,
        classId: validated.classId,
        teacherId: validated.teacherId,
      },
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Lesson update error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* ===================================================
   DELETE → Delete Lesson
=================================================== */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> }
) {
  try {
    const { schoolId: slug, id: lessonIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(slug);

    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can delete lessons" },
        { status: 403 }
      );
    }

    const lessonId = Number(lessonIdStr);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lesson ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json(
      { message: "Lesson deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Lesson delete error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}