import { NextRequest, NextResponse } from "next/server";
import { announcementSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";

// ---------------- PUT ----------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId, id } = await context.params;

    const body = await req.json();
    const data = announcementSchema.parse(body);

    const result = await prisma.announcement.updateMany({
      where: {
        id: Number(id),
        schoolId, // 🔒 tenant protection
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ---------------- DELETE ----------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId, id } = await context.params;

    const result = await prisma.announcement.deleteMany({
      where: {
        id: Number(id),
        schoolId, // 🔒 tenant protection
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
