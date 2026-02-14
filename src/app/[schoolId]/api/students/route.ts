import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StudentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const gradeId = searchParams.get("gradeId");
  const gender = searchParams.get("gender");
  const search = searchParams.get("search");

  try {
    const where: any = { status: StudentStatus.ACTIVE };

    if (classId) {
      where.classId = Number(classId);
    }

    if (gradeId) {
      where.Class = {
        ...(where.Class || {}),
        gradeId: Number(gradeId),
      };
    }

    if (gender) {
      where.gender = gender; // ✅ filter by gender
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        Class: true,
      },
      orderBy: [
        { classId: "asc" },
        { gender: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error("❌ Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
