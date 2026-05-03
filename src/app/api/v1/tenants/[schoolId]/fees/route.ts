export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const body = await req.json();

    const {
      gradeId,
      feeCycleId,
      feeType,       // TUITION / BUS / etc
      amount,
      academicYear,
    } = body;

    if (!gradeId || !feeCycleId || !feeType || !academicYear) {
      return NextResponse.json(
        { error: "gradeId, feeCycleId, feeType, academicYear required" },
        { status: 400 },
      );
    }

    /* ---------- Validate Grade ---------- */
    const grade = await db.grade.findFirst({
      where: { id: gradeId, schoolId },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade for this school" },
        { status: 400 },
      );
    }

    /* ---------- Validate FeeCycle ---------- */
    const cycle = await db.feeCycle.findFirst({
      where: {
        id: feeCycleId,
        schoolId,
        academicYearId: academicYear,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: "Invalid fee cycle" },
        { status: 400 },
      );
    }

    /* ---------- Check existing ---------- */
    const existing = await db.feeStructure.findUnique({
      where: {
        gradeId_feeCycleId_feeType_academicYearId_schoolId: {
          gradeId,
          feeCycleId,
          feeType,
          academicYearId: academicYear,
          schoolId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Fee structure already exists" },
        { status: 409 },
      );
    }

    /* ---------- Create ---------- */
    const fee = await db.feeStructure.create({
      data: {
        gradeId,
        feeCycleId,
        feeType,
        amount: Number(amount),
        academicYearId: academicYear,
        schoolId,
      },
    });

    return NextResponse.json(
      { success: true, fee },
      { status: 201 },
    );

  } catch (error) {
    console.error("Fee create error:", error);

    return NextResponse.json(
      { error: "Failed to create fee structure" },
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

    const { searchParams } = new URL(req.url);

    const studentId = searchParams.get("studentId");
    const gradeId = searchParams.get("gradeId");
    const classId = searchParams.get("classId");
    const academicYear = searchParams.get("academicYear");
    const feeCycleId = searchParams.get("feeCycleId");
    const feeType = searchParams.get("feeType");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const where: any = { schoolId };

    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYearId = Number(academicYear);
    if (feeCycleId) where.feeCycleId = Number(feeCycleId);
    if (feeType) where.feeType = feeType;

    if (gradeId) {
      where.feeStructure = {
        is: { gradeId: Number(gradeId) },
      };
    }

    if (classId) {
      where.student = {
        is: {
          enrollments: {
            some: {
              classId: Number(classId),
            },
          },
        },
      };
    }

    const [total, studentFees] = await db.$transaction([
      db.studentFees.count({ where }),

      db.studentFees.findMany({
        where,
        skip,
        take: limit,
        orderBy: { studentId: "desc" },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              enrollments: {
                select: {
                  class: {
                    select: {
                      id: true,
                      name: true,
                      section: true,
                    },
                  },
                },
                take: 1,
              },
            },
          },

          feeStructure: {
            select: {
              amount: true,
              feeType: true,
              feeCycle: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          feeCycle: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },

          _count: {
            select: {
              feeTransactions: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: studentFees,
    });

  } catch (error) {
    console.error("Fees list error:", error);

    return NextResponse.json(
      { error: "Failed to fetch student fees" },
      { status: 500 },
    );
  }
}