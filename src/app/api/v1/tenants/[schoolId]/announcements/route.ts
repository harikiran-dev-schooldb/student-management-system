import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/formValidationSchemas";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* =======================================================
   POST  /api/v1/tenants/[schoolId]/announcements
======================================================= */

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await context.params;

    const access = await requireTenantAccess();

    // 🔐 Tenant validation
    if (access.schoolId !== slug) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔐 Role validation
    if (access.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔎 Ensure school exists
    const schoolExists = await prisma.schoolInfo.findUnique({
      where: { schoolId: access.schoolId },
      select: { id: true },
    });

    if (!schoolExists) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    // 📦 Validate request body
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
          { message: "Invalid class for this school" },
          { status: 400 }
        );
      }
    }

    // 📝 Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
        schoolId: access.schoolId,
      },
    });

    return NextResponse.json(
      { success: true, announcement },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("POST Announcement Error:", error);

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
   GET  /api/v1/tenants/[schoolId]/announcements
   Optional query: ?classId=123
======================================================= */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await context.params;

    const access = await requireTenantAccess();

    // 🔐 Tenant validation
    if (access.schoolId !== slug) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔐 Role validation
    if (!["admin", "teacher", "student"].includes(access.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classIdParam = searchParams.get("classId");

    const whereClause: {
      schoolId: string;
      OR?: { classId: number | null }[];
    } = {
      schoolId: access.schoolId,
    };

    if (classIdParam !== null) {
      const parsedClassId = Number(classIdParam);

      if (isNaN(parsedClassId)) {
        return NextResponse.json(
          { message: "Invalid classId" },
          { status: 400 }
        );
      }

      whereClause.OR = [
        { classId: parsedClassId },
        { classId: null },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: { Class: true },
    });

    return NextResponse.json(
      { success: true, announcements },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("GET Announcement Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
