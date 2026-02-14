import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { grades } = await req.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const formattedGrades = grades.map((g: any) => ({
      id: parseInt(g.id),          // optional
      level: String(g.level).trim(),
      schoolId,                    // ✅ REQUIRED
    }));

    /* ----------------------------------
       Check duplicates (tenant scoped)
    -----------------------------------*/
    const existing = await prisma.grade.findMany({
      where: {
        schoolId,
        id: {
          in: formattedGrades.map((g) => g.id),
        },
      },
      select: { id: true },
    });

    const existingIdSet = new Set(existing.map((e) => e.id));

    const toInsert = formattedGrades.filter(
      (g) => !existingIdSet.has(g.id)
    );

    /* ----------------------------------
       Insert
    -----------------------------------*/
    if (toInsert.length > 0) {
      await prisma.grade.createMany({
        data: toInsert,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: `Upload complete: Inserted ${toInsert.length}, Skipped ${existing.length}`,
      skipped: existing,
    });

  } catch (err: any) {
    console.error("Bulk Grade Upload Error:", err);
    return NextResponse.json(
      { message: "Upload failed", error: err.message },
      { status: 500 }
    );
  }
}
