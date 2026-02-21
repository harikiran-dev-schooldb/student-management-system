import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { homeworkSchema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { v4 as uuidv4 } from "uuid";

/* ===================================================
   POST  → Create Homework (Single or Grade Bulk)
=================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string;}> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(schoolId);

    if (!user.userId || !["admin", "teacher"].includes(user.role!)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
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

    const { description, gradeId, classId, date } = parsed.data;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    /* ---------------- Validate Grade ---------------- */
    const grade = await prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade for this school" },
        { status: 400 }
      );
    }

    /* ----------------------------------
       SINGLE CLASS HOMEWORK
    -----------------------------------*/
    if (classId) {
      const cls = await prisma.class.findFirst({
        where: {
          id: classId,
          gradeId,
          schoolId,
        },
      });

      if (!cls) {
        return NextResponse.json(
          { error: "Invalid class for this grade" },
          { status: 400 }
        );
      }

      const hw = await prisma.homework.create({
        data: {
          description,
          gradeId,
          classId,
          date: parsedDate,
          schoolId,
        },
      });

      return NextResponse.json({ success: true, data: hw });
    }

    /* ----------------------------------
       BULK CREATE FOR GRADE
    -----------------------------------*/
    const groupId = uuidv4();

    await prisma.$transaction(async (tx) => {
      const classes = await tx.class.findMany({
        where: { gradeId, schoolId },
        select: { id: true },
      });

      if (!classes.length) {
        throw new Error("No classes found for this grade");
      }

      await tx.homework.createMany({
        data: classes.map((cls) => ({
          description,
          gradeId,
          classId: cls.id,
          date: parsedDate,
          groupId,
          schoolId,
        })),
      });
    });

    return NextResponse.json({
      success: true,
      groupId,
    });

  } catch (err: any) {
    console.error("Homework POST error:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ===================================================
   GET → List Homeworks (Filtered)
=================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const gradeId = searchParams.get("gradeId");
    const date = searchParams.get("date");

    const where: any = { schoolId };

    if (classId) {
      where.classId = Number(classId);
    }

    if (gradeId) {
      where.gradeId = Number(gradeId);
    }

    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        where.date = parsed;
      }
    }

    const homeworks = await prisma.homework.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        Class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(homeworks);

  } catch (error) {
    console.error("Homework GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch homeworks" },
      { status: 500 }
    );
  }
}
