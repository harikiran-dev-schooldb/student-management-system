export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const start = new Date(parsedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(parsedDate);
    end.setHours(23, 59, 59, 999);

    const exams = await prisma.exam.findMany({
      where: {
        schoolId,
        examGradeSubjects: {
          some: {
            schoolId,
            date: { gte: start, lte: end },
          },
        },
      },
      include: {
        examGradeSubjects: {
          where: {
            schoolId,
            date: { gte: start, lte: end },
          },
          include: {
            Grade: { select: { level: true } },
            Subject: { select: { name: true } },
          },
        },
      },
    });

    if (!exams.length) {
      return NextResponse.json(
        { message: "No exams found for this date" },
        { status: 404 }
      );
    }

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("by-date error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
