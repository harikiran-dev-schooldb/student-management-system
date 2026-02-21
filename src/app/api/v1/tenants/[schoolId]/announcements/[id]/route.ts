import { NextRequest, NextResponse } from "next/server";
import { announcementSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* =======================================================
   PUT  /api/v1/tenants/[schoolId]/announcements/[id]
======================================================= */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id } = await params;

    const access = await requireTenantAccess();

    // 🔐 Tenant validation
    if (access.schoolId !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔐 RBAC
    if (access.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Invalid announcement ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = announcementSchema.parse(body);

    // 🔎 Validate class belongs to this tenant
    if (data.classId !== undefined && data.classId !== null) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: data.classId,
          schoolId: access.schoolId,
        },
        select: { id: true },
      });

      if (!classExists) {
        return NextResponse.json(
          { error: "Invalid class for this school" },
          { status: 400 }
        );
      }
    }

    // 🔒 Update with strict tenant filter
    const existing = await prisma.announcement.findFirst({
      where: {
        id: parsedId,
        schoolId: access.schoolId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.announcement.update({
      where: { id: parsedId },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    return NextResponse.json(
      { success: true, announcement: updated },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("PUT Announcement Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.name === "ZodError"
            ? error.errors
            : error.message || "Internal Server Error",
      },
      { status: error.name === "ZodError" ? 400 : 500 }
    );
  }
}


/* =======================================================
   DELETE  /api/v1/tenants/[schoolId]/announcements/[id]
======================================================= */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id } = await context.params;

    const access = await requireTenantAccess();

    // 🔐 Tenant validation
    if (access.schoolId !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔐 RBAC
    if (access.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Invalid announcement ID" },
        { status: 400 }
      );
    }

    // 🔒 Ensure announcement belongs to tenant
    const existing = await prisma.announcement.findFirst({
      where: {
        id: parsedId,
        schoolId: access.schoolId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: { id: parsedId },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("DELETE Announcement Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
