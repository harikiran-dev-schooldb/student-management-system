export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const schoolId = access.schoolId;
    const db = tenantPrisma(schoolId);

    const { grades } = await req.json();

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { message: "Invalid grades array" },
        { status: 400 },
      );
    }

    const formattedGrades = grades
      .filter((g: any) => g?.level && g?.branchId)
      .map((g: any) => ({
        level: String(g.level).trim(),
        branchId: Number(g.branchId),
        schoolId,
      }));

    if (!formattedGrades.length) {
      return NextResponse.json(
        { message: "No valid grades provided" },
        { status: 400 },
      );
    }

    const created = await db.grade.createMany({
      data: formattedGrades,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Grades uploaded successfully",
        created: created.count,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Bulk Grade Upload Error:", err);

    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;

    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const grades = await db.grade.findMany({
      where: {
        schoolId,
      },
      orderBy: {
        id: "asc",
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(grades);

  } catch (error: any) {
    console.error("Fetch grades error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch grades" },
      { status: 500 },
    );
  }
}