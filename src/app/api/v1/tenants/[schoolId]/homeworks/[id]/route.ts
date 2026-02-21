import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { homeworkSchema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ===================================================
   PUT → Update Homework (Single or Group)
=================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id: homeworkIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(schoolId);
    if (!user.userId || !["admin", "teacher"].includes(user.role!)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const homeworkId = Number(homeworkIdStr);
    if (isNaN(homeworkId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = homeworkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existing = await prisma.homework.findFirst({
      where: {
        id: homeworkId,
        schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Homework not found" },
        { status: 404 }
      );
    }

    const parsedDate = new Date(parsed.data.date);

    await prisma.$transaction(async (tx) => {
      if (existing.groupId) {
        await tx.homework.updateMany({
          where: {
            groupId: existing.groupId,
            schoolId,
          },
          data: {
            description: parsed.data.description,
            date: parsedDate,
          },
        });
      } else {
        await tx.homework.update({
          where: { id: homeworkId },
          data: {
            description: parsed.data.description,
            date: parsedDate,
          },
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Homework PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update homework" },
      { status: 500 }
    );
  }
}

/* ===================================================
   DELETE → Delete Homework (Single or Group)
=================================================== */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: slug, id: homeworkIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(schoolId);
    if (!user.userId || !["admin", "teacher"].includes(user.role!)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const homeworkId = Number(homeworkIdStr);
    if (isNaN(homeworkId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.homework.findFirst({
      where: {
        id: homeworkId,
        schoolId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Homework not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (existing.groupId) {
        await tx.homework.deleteMany({
          where: {
            groupId: existing.groupId,
            schoolId,
          },
        });
      } else {
        await tx.homework.delete({
          where: { id: homeworkId },
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Homework DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete homework" },
      { status: 500 }
    );
  }
}