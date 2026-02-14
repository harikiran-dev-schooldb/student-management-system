// app/api/lessons/[id]/route.ts
import { lessonsSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PUT(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    const lessonId = parseInt(id);
    
    if (!lessonId) {
        return NextResponse.json({ message: "Lesson ID is required" }, { status: 400 });
    }
    
    const body = await req.json();
    
    // Validate using the same schema (excluding `id`)
    const validated = lessonsSchema.parse(body);

    function timeStringToDate(timeStr: string): Date {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    // Check if the lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
    });

    if (!existingLesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }

    // Fetch the subject to get its name
    const subject = await prisma.subject.findUnique({
      where: { id: validated.subjectId },
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: Number(lessonId) },
      data: {
        title: subject.name, // set title using subject name
        day: validated.day,
        period: validated.period,
        subjectId: validated.subjectId,
        classId: validated.classId,
        teacherId: validated.teacherId,
      },
    });

    return NextResponse.json(updatedLesson, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    console.error("Lesson update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// app/api/lessons/[id]/route.ts
export async function DELETE(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id); // Get the `id` from the URL parameters

    if (!lessonId) {
      return NextResponse.json({ message: "Lesson ID is required" }, { status: 400 });
    }

    // Check if the lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
    });

    if (!existingLesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: Number(lessonId) },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Lesson deletion error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}