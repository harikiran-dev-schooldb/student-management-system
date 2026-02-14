import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { classSchema } from "@/lib/formValidationSchemas"; // Make sure `id` is optional here
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = classSchema.extend({ id: z.coerce.number() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, section, gradeId, supervisorId } = parsed.data;

    const cleanedSupervisorId =
      supervisorId && supervisorId.trim() !== "" ? supervisorId : null;

    // Get grade for updated name
    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) {
      return NextResponse.json(
        { error: "Invalid gradeId: grade not found" },
        { status: 400 }
      );
    }

    const name = `${grade.level} - ${section}`;

    // 🔁 Unassign the supervisor if they are assigned to another class
    if (cleanedSupervisorId) {
      await prisma.class.updateMany({
        where: {
          supervisorId: cleanedSupervisorId,
          NOT: { id }, // Exclude current class
        },
        data: {
          supervisorId: null,
        },
      });
    }

    // ✅ Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        section,
        gradeId,
        supervisorId: cleanedSupervisorId,
        name,
      },
    });

    return NextResponse.json({ success: true, data: updatedClass }, { status: 200 });
  } catch (error: any) {
    console.error("Class update error:", error?.code || error);

    if (error.code === "P2002") {
      const target = error.meta?.target;

      if (target?.includes("Class_gradeId_section_key")) {
        return NextResponse.json(
          {
            success: false,
            error: "Class with this grade and section already exists.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Supervisor is already assigned to another class.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
