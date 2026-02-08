import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, type, studentId, classId, gradeId } = await req.json();
    const formattedDate = new Date().toISOString();

    // 1. Message to a specific student
    if (studentId) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: formattedDate,
          Student: { connect: { id: studentId } },
          ...(classId && { Class: { connect: { id: Number(classId) } } }),
        },
      });

      return NextResponse.json(
        { success: true, message: "Message sent to student", data: newMessage },
        { status: 201 }
      );
    }

    // 2. Message to a whole class (single message)
    if (classId) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: formattedDate,
          Class: { connect: { id: Number(classId) } },
        },
      });

      return NextResponse.json(
        { success: true, message: "Message sent to class", data: newMessage },
        { status: 201 }
      );
    }

    // 3. Message to all classes in a grade (multiple messages — one per class)
    if (gradeId) {
      const classesInGrade = await prisma.class.findMany({
        where: { gradeId: Number(gradeId) },
        select: { id: true },
      });

      const messages = await Promise.all(
        classesInGrade.map((cls) =>
          prisma.messages.create({
            data: {
              message,
              type,
              date: formattedDate,
              Class: { connect: { id: cls.id } },
            },
          })
        )
      );

      return NextResponse.json(
        { success: true, message: "Message sent to all classes in grade", count: messages.length },
        { status: 201 }
      );
    }

    // 4. Message to whole school (no classId)
    const newMessage = await prisma.messages.create({
      data: {
        message,
        type,
        date: formattedDate,
        classId: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Message sent school-wide", data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.messages.findMany({
      orderBy: { date: "desc" }, // latest first
      include: {
        Student: { select: { name: true } },
        Class: { select: { name: true } },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}