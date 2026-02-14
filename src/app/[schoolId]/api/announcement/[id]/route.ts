import { NextRequest, NextResponse } from "next/server";
import { announcementSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";

// Update Announcement
export async function PUT(req: NextRequest) {
  const paramId = req.nextUrl.pathname.split("/")[3]; // Assuming `/api/announcement/[id]`

  try {
    const body = await req.json();

    const data = announcementSchema.parse({
      ...body,
      id: Number(paramId),
    });

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: Number(paramId)  },
      data,
    });

    return NextResponse.json({ success: true, updatedAnnouncement }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/announcement/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete Announcement
export async function DELETE(req: NextRequest) {
  const paramId = req.nextUrl.pathname.split("/")[3]; // Assuming `/api/announcement/[id]`

  try {
    const deletedAnnouncement = await prisma.announcement.delete({
      where: { id: Number(paramId)  },
    });

    return NextResponse.json({ success: true, deletedAnnouncement }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/announcement/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
