export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const body = await req.json();

    const {
      gradeId,
      term,
      academicYear,
      startDate,
      dueDate,
      termFees,
      abacusFees = 0,
    } = body;

    if (!gradeId || !term || !academicYear) {
      return NextResponse.json(
        { error: "gradeId, term, academicYear required" },
        { status: 400 },
      );
    }

    /* ---------- Validate Grade belongs to school ---------- */
    const grade = await prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Invalid grade for this school" },
        { status: 400 },
      );
    }

    /* ---------- Check existing composite unique ---------- */
    const existing = await prisma.feeStructure.findUnique({
      where: {
        gradeId_term_academicYear_schoolId: {
          gradeId,
          term,
          academicYear,
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

    const fee = await prisma.feeStructure.create({
      data: {
        gradeId,
        term,
        academicYear,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        termFees: Number(termFees),
        abacusFees: Number(abacusFees),
        schoolId,
      },
    });

    return NextResponse.json({ success: true, fee }, { status: 201 });
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
  { params }: { params: Promise<{ schoolId: string; }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const { searchParams } = new URL(req.url);

    const studentId = searchParams.get("studentId");
    const gradeId = searchParams.get("gradeId");
    const classId = searchParams.get("classId");
    const academicYear = searchParams.get("academicYear");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const where: any = { schoolId };

    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYear = academicYear;

    if (gradeId) {
      where.feeStructure = {
        gradeId: Number(gradeId),
      };
    }

    if (classId) {
      where.student = {
        classId: Number(classId),
      };
    }

    const [total, studentFees] = await prisma.$transaction([
      prisma.studentFees.count({ where }),
      prisma.studentFees.findMany({
        where,
        skip,
        take: limit,
        orderBy: { studentId: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              classId: true,
            },
          },
          feeStructure: {
            select: {
              term: true,
              academicYear: true,
              termFees: true,
            },
          },
          _count: {
            select: { feeTransactions: true },
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
      { status: 500 }
    );
  }
}

