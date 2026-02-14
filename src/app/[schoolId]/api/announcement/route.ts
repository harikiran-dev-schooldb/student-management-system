import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const body = await req.json();
    const data = announcementSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
        schoolId, // ✅ multi-tenant safe
      },
    });

    return NextResponse.json(
      { success: true, announcement },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating announcement:", error);

    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
