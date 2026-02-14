import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { grades } = await req.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const formattedGrades = grades.map((g: any) => ({
      id: parseInt(g.id),
      level: g.level,
    }));

    const existingIds = await prisma.grade.findMany({
      where: {
        id: {
          in: formattedGrades.map((g) => g.id),
        },
      },
      select: { id: true },
    });

    const duplicates = formattedGrades.filter((g) =>
      existingIds.some((e) => e.id === g.id)
    );

    const toInsert = formattedGrades.filter(
      (g) => !duplicates.includes(g)
    );

    await prisma.grade.createMany({
      data: toInsert,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Upload complete: Inserted ${toInsert.length}, Skipped ${duplicates.length}`,
      duplicates,
    });
  } catch (err) {
    console.error("Bulk Grade Upload Error:", err);
    return NextResponse.json(
      { message: "Upload failed", error: (err as any)?.message },
      { status: 500 }
    );
  }
}
