import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Destructure new fields (title, data) alongside existing ones
    const { message, title, type, studentId, classId, gradeId, data } = await req.json();
    const formattedDate = new Date(); // Use Date object, Prisma handles ISO conversion

    // Prepare common data object to avoid repetition
    const notificationPayload = {
      title: title || "New Notification", // Fallback title
      message,
      type,
      date: formattedDate,
      isRead: false, // Default to unread for notifications
      data: data || { screen: "NotificationList" }, // Default metadata for app navigation
    };

    // ---------------------------------------------------------
    // SCENARIO 1: Message to a Specific Student
    // ---------------------------------------------------------
    if (studentId) {
      const newMessage = await prisma.messages.create({
        data: {
          ...notificationPayload,
          studentId: studentId,
          classId: classId ? Number(classId) : null,
        },
      });

      return NextResponse.json(
        { success: true, message: "Message sent to student", data: newMessage },
        { status: 201 }
      );
    }

    // ---------------------------------------------------------
    // SCENARIO 2: Message to a Whole Class
    // (Logic Change: We create individual messages for each student so it appears in their app)
    // ---------------------------------------------------------
    if (classId) {
      // Fetch all ACTIVE students in this class
      const students = await prisma.student.findMany({
        where: { 
          classId: Number(classId),
          status: "ACTIVE" 
        },
        select: { id: true },
      });

      if (students.length === 0) {
        return NextResponse.json(
          { success: false, message: "No active students found in this class." },
          { status: 404 }
        );
      }

      // Create bulk messages
      await prisma.messages.createMany({
        data: students.map((student) => ({
          ...notificationPayload,
          studentId: student.id,
          classId: Number(classId),
        })),
      });

      return NextResponse.json(
        { success: true, message: `Message sent to ${students.length} students in class` },
        { status: 201 }
      );
    }

    // ---------------------------------------------------------
    // SCENARIO 3: Message to a Whole Grade
    // ---------------------------------------------------------
    if (gradeId) {
      // Fetch all students in this grade (across all sections)
      const students = await prisma.student.findMany({
        where: { 
          Class: { gradeId: Number(gradeId) },
          status: "ACTIVE" 
        },
        select: { id: true, classId: true },
      });

      if (students.length === 0) {
        return NextResponse.json(
          { success: false, message: "No active students found in this grade." },
          { status: 404 }
        );
      }

      // Create bulk messages
      await prisma.messages.createMany({
        data: students.map((student) => ({
          ...notificationPayload,
          studentId: student.id,
          classId: student.classId,
        })),
      });

      return NextResponse.json(
        { success: true, message: `Message sent to ${students.length} students in grade` },
        { status: 201 }
      );
    }

    // ---------------------------------------------------------
    // SCENARIO 4: Whole School Broadcast
    // ---------------------------------------------------------
    
    // Fetch ALL active students
    const allStudents = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, classId: true }
    });

    await prisma.messages.createMany({
      data: allStudents.map((student) => ({
        ...notificationPayload,
        studentId: student.id,
        classId: student.classId,
      })),
    });

    return NextResponse.json(
      { success: true, message: `Broadcast sent to ${allStudents.length} students` },
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Filter logic for specific student (App Usage)
    const whereClause: any = {};
    if (studentId) {
        whereClause.studentId = studentId;
    }
    if (unreadOnly) {
        whereClause.isRead = false;
    }

    const messages = await prisma.messages.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      // Limit to 100 to prevent overwhelming the client
      take: 100, 
      include: {
        Student: { select: { name: true } },
        Class: { select: { name: true, section: true } },
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