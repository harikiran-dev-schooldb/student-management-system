// app/api/messages/[id]/route.ts

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    // 1. Extract ID from the route: /api/messages/[id]
    const paramId = req.nextUrl.pathname.split("/").pop();

    if (!paramId) {
      return NextResponse.json(
        { success: false, message: "Message ID is required" },
        { status: 400 }
      );
    }

    // 2. Get request body
    const body = await req.json();
    const { message, type, studentId, date, classId } = body;

    if (!message || !type) {
      return NextResponse.json(
        { success: false, message: "Message and type are required" },
        { status: 400 }
      );
    }

    // 3. Optional: Validate logic if needed
    if (type === "ANNOUNCEMENT" && !classId) {
      return NextResponse.json(
        { success: false, message: "Class ID is required for announcements" },
        { status: 400 }
      );
    }

    // 4. Format date
    const formattedDate = date ? new Date(date).toISOString() : new Date().toISOString();

    // 5. Update message
    const updatedMessage = await prisma.messages.update({
      where: { id: paramId },
      data: {
        message,
        type,
        date: formattedDate,
        classId: classId ?? null,     // disconnect if null
        studentId: studentId ?? null, // disconnect if null
      },
    });

    return NextResponse.json({ success: true, data: updatedMessage }, { status: 200 });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update message" },
      { status: 500 }
    );
  }
}