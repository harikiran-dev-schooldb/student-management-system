import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; schoolId: string }> }
) {
  try {
    const { id: teacherId, schoolId } = await params;

    const mappings = await prisma.subjectTeacher.findMany({
      where: {
        teacherId,
        schoolId, // ✅ TENANT SAFE
      },
      include: {
        subject: true,
        class: true,
      },
      orderBy: {
        class: { name: "asc" },
      },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; schoolId: string }> }
) {
  try {
    const { id: teacherId, schoolId } = await params;
    const { assignments } = await req.json();

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Invalid data format. 'assignments' array required." },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      assignments.map((item: { subjectId: number; classId: number }) =>
        prisma.subjectTeacher.upsert({
          where: {
            subjectId_teacherId_classId_schoolId: { // ✅ FIXED
              teacherId,
              subjectId: Number(item.subjectId),
              classId: Number(item.classId),
              schoolId,
            },
          },
          update: {},
          create: {
            teacherId,
            subjectId: Number(item.subjectId),
            classId: Number(item.classId),
            schoolId, // ✅ REQUIRED
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Assignments updated successfully", data: results },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning subjects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; schoolId: string }> }
) {
  try {
    const { id: teacherId, schoolId } = await params;

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");

    if (!subjectId || !classId) {
      return NextResponse.json(
        { error: "subjectId and classId required" },
        { status: 400 }
      );
    }

    await prisma.subjectTeacher.delete({
      where: {
        subjectId_teacherId_classId_schoolId: { // ✅ FIXED
          teacherId,
          subjectId: Number(subjectId),
          classId: Number(classId),
          schoolId,
        },
      },
    });

    return NextResponse.json({ message: "Assignment removed" });
  } catch (error) {
    console.error("Error removing assignment:", error);
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
