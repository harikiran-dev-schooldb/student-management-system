import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await context.params;

    const { grades } = await req.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // 🔥 STEP 1: Find school by slug
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    // 🔥 STEP 2: Use PRIMARY KEY for FK
    const formattedGrades = grades.map((g: any) => ({
      level: String(g.level).trim(),
      schoolId: school.id, // ✅ THIS IS THE FIX
    }));

    // 🔥 STEP 3: Insert
    await prisma.grade.createMany({
      data: formattedGrades,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "Grades uploaded successfully",
    });

  } catch (err: any) {
    console.error("Bulk Grade Upload Error:", err);
    return NextResponse.json(
      { message: "Upload failed", error: err.message },
      { status: 500 }
    );
  }
}

