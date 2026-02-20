import { resolveSchoolId } from "@/lib/resolveSchool";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  const schoolId = await resolveSchoolId(context.params.schoolId);
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
