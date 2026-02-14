import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { homeworkSchema } from "@/lib/formValidationSchemas";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const body = await req.json();
    const parsed = homeworkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid data", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { description, gradeId, classId, date } = parsed.data;

    /* ----------------------------------
       Single Class Homework
    -----------------------------------*/
    if (classId !== undefined) {
      const hw = await prisma.homework.create({
        data: {
          description,
          gradeId,
          classId,
          date: new Date(date),
          schoolId, // ✅ REQUIRED
        },
      });

      return NextResponse.json({ success: true, data: hw });
    }

    /* ----------------------------------
       Bulk Create for Grade
    -----------------------------------*/
    const groupId = uuidv4();

    const classes = await prisma.class.findMany({
      where: { gradeId, schoolId }, // ✅ Tenant filter
      select: { id: true },
    });

    const data = classes.map(({ id }) => ({
      description,
      gradeId,
      classId: id,
      date: new Date(date),
      groupId,
      schoolId, // ✅ REQUIRED
    }));

    if (data.length > 0) {
      await prisma.homework.createMany({ data });
    }

    return NextResponse.json({ success: true, groupId });

  } catch (err) {
    console.error("POST /api/homeworks error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const homeworks = await prisma.homework.findMany({
      where: { schoolId }, // ✅ tenant filter
      orderBy: { date: "desc" },
      include: {
        Class: {
          select: {
            name: true,
            students: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const formatted = homeworks.map(hw => ({
      ...hw,
      type: "HOMEWORK",
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("Error fetching homeworks:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch homeworks" },
      { status: 500 }
    );
  }
}
