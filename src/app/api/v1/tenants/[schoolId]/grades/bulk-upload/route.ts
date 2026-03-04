import prisma from "@/lib/prisma";
import { bulkGradeSchema } from "@/lib/formValidationSchemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;

    const parsed = bulkGradeSchema.safeParse(await req.json());

    if (!parsed.success) {
      console.log("Zod errors:", parsed.error.flatten());
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { grades } = parsed.data;

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

    const branchIds = [...new Set(grades.map((g) => g.branchId))];

    const branches = await prisma.branch.findMany({
      where: {
        id: { in: branchIds },
        schoolId: school.id,
      },
      select: { id: true },
    });

    if (branches.length !== branchIds.length) {
      return NextResponse.json(
        { message: "One or more branchIds are invalid for this school" },
        { status: 400 }
      );
    }

    await prisma.grade.createMany({
      data: grades.map((g) => ({
        level: g.level,
        schoolId: school.id,
        branchId: g.branchId,
      })),
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