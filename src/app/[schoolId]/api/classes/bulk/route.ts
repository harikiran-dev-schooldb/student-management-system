import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { classes } = await req.json();

    if (!Array.isArray(classes)) {
      return NextResponse.json(
        { message: "Invalid input format" },
        { status: 400 }
      );
    }

    const results = {
      inserted: 0,
      skipped: 0,
      failed: 0,
      messages: [] as string[],
    };

    for (const cls of classes) {
      const section =
        typeof cls.section === "string" ? cls.section.trim() : null;

      const gradeId = Number(cls.gradeId);

      const supervisorId =
        typeof cls.supervisorId === "string"
          ? cls.supervisorId.trim()
          : undefined;

      if (!gradeId || isNaN(gradeId)) {
        results.skipped++;
        results.messages.push(`Missing or invalid gradeId`);
        continue;
      }

      // ✅ Grade must belong to same school
      const grade = await prisma.grade.findFirst({
        where: {
          id: gradeId,
          schoolId,
        },
      });

      if (!grade) {
        results.skipped++;
        results.messages.push(`Grade ID ${gradeId} not found`);
        continue;
      }

      // ✅ Duplicate check must include schoolId
      const existing = await prisma.class.findFirst({
        where: {
          section,
          gradeId,
          schoolId,
        },
      });

      if (existing) {
        results.skipped++;
        results.messages.push(
          `Duplicate skipped: ${grade.level}-${section}`
        );
        continue;
      }

      try {
        await prisma.class.create({
          data: {
            section,
            gradeId,
            supervisorId,
            schoolId, // ✅ REQUIRED
          },
        });

        results.inserted++;
        results.messages.push(
          `Inserted: ${grade.level}-${section}`
        );
      } catch (error: any) {
        results.failed++;
        results.messages.push(
          `Failed: ${grade.level}-${section} (${error.code ?? "ERR"})`
        );
      }
    }

    return NextResponse.json({
      message: "Bulk class upload complete",
      ...results,
    });
  } catch (err: any) {
    console.error("Bulk Class Upload Error:", err);

    return NextResponse.json(
      {
        message: "Upload failed",
        error: err?.message,
      },
      { status: 500 }
    );
  }
}
