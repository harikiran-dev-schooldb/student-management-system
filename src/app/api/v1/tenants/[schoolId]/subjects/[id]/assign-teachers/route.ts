export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: slug, id: subjectIdStr } = await params;

    const schoolId = await resolveSchoolId(slug);
    const subjectId = Number(subjectIdStr);

    if (isNaN(subjectId)) {
      return NextResponse.json(
        { error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { assignments } = await req.json();

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { error: "Assignments required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    const teacherIds = assignments.map(a => a.teacherId);
    const classIds = assignments.map(a => a.classId);

    const teachers = await prisma.teacher.findMany({
      where: { id: { in: teacherIds }, schoolId },
      select: { id: true },
    });

    const classes = await prisma.class.findMany({
      where: { id: { in: classIds }, schoolId },
      select: { id: true },
    });

    if (
      teachers.length !== teacherIds.length ||
      classes.length !== classIds.length
    ) {
      return NextResponse.json(
        { error: "Invalid teacher or class in assignments" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const assignment of assignments) {
        await tx.subjectTeacher.upsert({
          where: {
            subjectId_teacherId_classId_schoolId: {
              subjectId,
              teacherId: assignment.teacherId,
              classId: assignment.classId,
              schoolId,
            },
          },
          update: {},
          create: {
            subjectId,
            teacherId: assignment.teacherId,
            classId: assignment.classId,
            schoolId,
          },
        });
      }
    });

    return NextResponse.json(
      { success: true, message: "Assignments saved." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Assign subject-teacher error:", error);
    return NextResponse.json(
      { error: "Failed to assign teachers" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string, id: string }> }
) {
  try {
    const { schoolId: slug, id: subjectIdStr } = await params;
    const schoolId = await resolveSchoolId(slug);
    const subjectId = Number(subjectIdStr);

    const assignments = await prisma.subjectTeacher.findMany({
      where: { subjectId, schoolId },
      include: {
        teacher: true,
        class: true,
      },
      orderBy: { classId: "asc" },
    });

    return NextResponse.json(assignments);

  } catch (error) {
    console.error("Fetch assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}