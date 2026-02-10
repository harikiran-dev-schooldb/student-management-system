import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


// GET: Fetch all subjects/classes assigned to this teacher
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mappings = await prisma.subjectTeacher.findMany({
      where: {
        teacherId: id,
      },
      include: {
        subject: true, // Returns { id, name, ... }
        class: true,   // Returns { id, name, ... }
      },
      orderBy: {
        class: {
          name: 'asc' // Sort by class name for better UI
        }
      }
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

// POST: Assign specific subjects and classes to the teacher (Upsert)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params to get the dynamic ID (Next.js 15 requirement)
    const { id } = await params;
    const teacherId = id;

    const body = await req.json();
    
    // Expecting body: { assignments: [{ subjectId: 1, classId: 5 }, ...] }
    const { assignments } = body;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID missing" }, { status: 400 });
    }

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Invalid data format. 'assignments' array required." },
        { status: 400 }
      );
    }

    // 2. Transaction ensures all upserts happen or fail together
    const results = await prisma.$transaction(
      assignments.map((item: { subjectId: string | number; classId: string | number }) =>
        prisma.subjectTeacher.upsert({
          where: {
            subjectId_teacherId_classId: {
              teacherId: teacherId,
              subjectId: Number(item.subjectId),
              classId: Number(item.classId),
            },
          },
          // If relationship exists, do nothing
          update: {},
          // If relationship does not exist, create it
          create: {
            teacherId: teacherId,
            subjectId: Number(item.subjectId),
            classId: Number(item.classId),
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

// DELETE: Remove a specific subject mapping
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = id;
    
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");

    if (!subjectId || !classId) {
      return NextResponse.json(
        { error: "subjectId and classId query params are required" },
        { status: 400 }
      );
    }

    await prisma.subjectTeacher.delete({
      where: {
        subjectId_teacherId_classId: {
          teacherId: teacherId,
          subjectId: Number(subjectId),
          classId: Number(classId),
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