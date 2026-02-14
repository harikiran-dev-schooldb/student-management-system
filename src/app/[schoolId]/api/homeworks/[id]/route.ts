import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { homeworkSchema } from "@/lib/formValidationSchemas";

// ✅ UPDATE homework or group
export async function PUT(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const homeworkid = parseInt(id);
    if (isNaN(homeworkid)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = homeworkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid data", errors: parsed.error.errors }, { status: 400 });
    }

    const existing = await prisma.homework.findUnique({ where: { id: homeworkid } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Homework not found" }, { status: 404 });
    }

    // Update all if grouped, else one
    if (existing.groupId) {
      await prisma.homework.updateMany({
        where: { groupId: existing.groupId },
        data: {
          description: parsed.data.description,
          date: parsed.data.date,
        },
      });
    } else {
      await prisma.homework.update({
        where: { id: homeworkid },
        data: {
          description: parsed.data.description,
          date: parsed.data.date,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/homeworks/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ✅ DELETE homework or all in group
export async function DELETE(_req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const homeworkid = parseInt(id);
    if (isNaN(homeworkid)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.homework.findUnique({ where: { id:homeworkid  } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Homework not found" }, { status: 404 });
    }

    if (existing) {
      await prisma.homework.delete({
        where: { id: homeworkid },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/homeworks/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
