import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { classSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await context.params;
    const body = await req.json();

    const parsed = classSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    // 🔥 STEP 1: Find school by slug
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 },
      );
    }

    const { section, gradeId, supervisorId } = parsed.data;
    const cleanedSupervisorId = supervisorId?.trim() || undefined;

    // ✅ Grade must belong to this school
    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        schoolId: school.id,
      },
    });

    if (!grade) {
      return NextResponse.json(
        { success: false, error: "Invalid grade ID" },
        { status: 400 },
      );
    }

    const name = `${grade.level} - ${section}`;

    // ✅ Remove supervisor only inside same school
    if (cleanedSupervisorId) {
      await prisma.class.updateMany({
        where: {
          supervisorId: cleanedSupervisorId,
          schoolId: school.id,
        },
        data: { supervisorId: null },
      });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        gradeId,
        supervisorId: cleanedSupervisorId,
        schoolId: school.id,
      },
    });

    return NextResponse.json(
      { success: true, data: newClass },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("API error:", error);

    if (error.code === "P2002") {
      const target = error.meta?.target || [];

      if (target.includes("Class_gradeId_section_schoolId_key")) {
        return NextResponse.json(
          {
            success: false,
            error: "Class with this grade and section already exists.",
          },
          { status: 409 },
        );
      }

      if (target.includes("supervisorId")) {
        return NextResponse.json(
          {
            success: false,
            error: "This supervisor is already assigned to another class.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
