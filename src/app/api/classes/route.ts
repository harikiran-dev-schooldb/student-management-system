import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gradeId = searchParams.get("gradeId");
  const teacherId = searchParams.get("teacherId");

  try {
    const where: any = {};

    // 1. Grade ID is an Integer
    if (gradeId) {
      where.gradeId = Number(gradeId);
    }

    // 2. CRITICAL FIX: Teacher ID is a String (UUID), NOT a Number.
    // Ensure your Class model has a 'supervisorId' field.
    if (teacherId) {
      where.supervisorId = teacherId;
    }

    const classes = await prisma.class.findMany({
      where,
      // Sorting by name is usually better for UI than ID
      orderBy: { name: "asc" },
      include: {
        // 3. FIX: Relation names are typically camelCase (e.g., 'supervisor' or 'teacher')
        // Check your schema: `supervisor Teacher @relation(...)`
        Teacher: {
          select: {
            id: true,
            name: true,
            // surname: true, // Uncomment if you have this field
          },
        },
        // Optional: Include grade to show "Grade 5 - Class A"
        Grade: true,
      },
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error("❌ Error fetching classes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
