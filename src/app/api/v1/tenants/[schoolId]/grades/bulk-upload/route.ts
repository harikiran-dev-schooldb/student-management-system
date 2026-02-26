export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const slug = (await params).schoolId;

    const body = await req.json();
    const grades = body?.grades;

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { message: "Invalid grades array" },
        { status: 400 }
      );
    }

    // 🔹 Find school by slug
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    // 🔹 Format data
    const formattedGrades = grades.map((g: any) => ({
      level: String(g.level).trim(),
      schoolId: school.id, // FK (primary key)
    }));

    // 🔹 Insert
    await prisma.grade.createMany({
      data: formattedGrades,
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Grades uploaded successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Bulk Grade Upload Error:", error);

    return NextResponse.json(
      { message: "Upload failed", error: error.message },
      { status: 500 }
    );
  }
}