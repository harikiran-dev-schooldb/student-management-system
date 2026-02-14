import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// DELETE /api/classes/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 👈 You must await it
    const classId = parseInt(id);

    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: "Invalid class ID" },
        { status: 400 }
      );
    }

    // Check if class exists
    const existing = await prisma.class.findUnique({ where: { id: classId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // Delete class
    await prisma.class.delete({ where: { id: classId } });

    return NextResponse.json({ success: true, message: "Class deleted successfully" });
  } catch (error: any) {
    console.error("Delete class error:", error);
    return NextResponse.json(
      { success: false, error: "Server error. Could not delete class." },
      { status: 500 }
    );
  }
}
