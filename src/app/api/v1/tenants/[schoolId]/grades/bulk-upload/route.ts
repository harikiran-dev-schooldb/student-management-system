import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { bulkGradeSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* ================================
       Resolve Tenant
    ================================= */

    const { schoolId: slug} = await params;

    /* 1️⃣ Tenant Access */
    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    if (access.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    /* 2️⃣ Validate Request */
    const parsed = bulkGradeSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { grades } = parsed.data;

    /* 3️⃣ Validate Branch Ownership */
    const branchIds = [...new Set(grades.map((g) => g.branchId))];

    const branches = await prisma.branch.findMany({
      where: {
        id: { in: branchIds },
        schoolId,
      },
      select: { id: true },
    });

    if (branches.length !== branchIds.length) {
      return NextResponse.json(
        { message: "One or more branchIds are invalid for this school" },
        { status: 400 }
      );
    }

    /* 4️⃣ Create Grades */
    await prisma.grade.createMany({
      data: grades.map((g) => ({
        level: g.level,
        schoolId,
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