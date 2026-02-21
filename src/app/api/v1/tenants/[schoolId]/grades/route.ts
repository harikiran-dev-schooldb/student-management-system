import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: slug } = await params;

    const { grades } = await req.json();

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { message: "Invalid grades array" },
        { status: 400 },
      );
    }

    // Find school
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 },
      );
    }

    const formattedGrades = grades
      .filter((g: any) => g?.level)
      .map((g: any) => ({
        level: String(g.level).trim(),
        schoolId: school.id, // ✅ REQUIRED
      }));

    if (formattedGrades.length === 0) {
      return NextResponse.json(
        { message: "No valid grades provided" },
        { status: 400 },
      );
    }

    await prisma.grade.createMany({
      data: formattedGrades,
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Grades uploaded successfully" },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Bulk Grade Upload Error:", err);

    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: slug } = await params;

    // 🔎 Resolve school using slug
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const grades = await prisma.grade.findMany({
      where: {
        schoolId: school.id, // ✅ correct FK usage
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(grades);
  } catch (error: any) {
    console.error("❌ Error fetching grades:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grades" },
      { status: 500 },
    );
  }
}
