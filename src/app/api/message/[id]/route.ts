// app/api/messages/[id]/route.ts

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 1. Add { params } as the second argument
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Message ID is required" },
        { status: 400 }
      );
    }

    // 2. Get request body with NEW fields
    const body = await req.json();
    const { message, title, type, studentId, date, classId, isRead, data } = body;

    if (!message || !type) {
      return NextResponse.json(
        { success: false, message: "Message and type are required" },
        { status: 400 }
      );
    }

    // 3. Format date safely
    const formattedDate = date ? new Date(date) : new Date();

    // 4. Update message
    const updatedMessage = await prisma.messages.update({
      where: { id: id },
      data: {
        title,          // 🆕 Update Title
        message,
        type,
        date: formattedDate,
        isRead: isRead, // 🆕 Allow marking as read/unread via API
        data: data,     // 🆕 Update metadata/navigation logic
        
        // Connections
        classId: classId ? Number(classId) : null,
        studentId: studentId ?? null,
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