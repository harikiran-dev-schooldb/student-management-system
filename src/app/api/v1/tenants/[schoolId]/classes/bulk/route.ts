export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId: schoolSlug } = await params;
  const schoolId = await resolveSchoolId(schoolSlug);
  const { classes } = await req.json();

  if (!Array.isArray(classes)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const results = { inserted: 0, skipped: 0 };

  for (const cls of classes) {
    const grade = await prisma.grade.findFirst({
      where: { id: Number(cls.gradeId), schoolId },
    });

    if (!grade) {
      results.skipped++;
      continue;
    }

    await prisma.class.create({
      data: {
        section: cls.section,
        gradeId: grade.id,
        schoolId,
      },
    });

    results.inserted++;
  }

  return NextResponse.json(results);
}
