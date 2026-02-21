import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   GET → Get Teacher Subject Assignments (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: teacherId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure teacher belongs to this school
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const mappings = await prisma.subjectTeacher.findMany({
      where: {
        teacherId,
        schoolId,
      },
      include: {
        subject: true,
        class: true,
      },
      orderBy: {
        class: { name: "asc" },
      },
    });

    return NextResponse.json(mappings, { status: 200 });
  } catch (error) {
    console.error("GET teacher subjects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

/* ======================================================
   POST → Replace Teacher Assignments (Safe Upsert)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: teacherId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { assignments } = await req.json();

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "'assignments' array required" },
        { status: 400 },
      );
    }

    // Validate teacher
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const subjectIds = assignments.map((a: any) => Number(a.subjectId));
    const classIds = assignments.map((a: any) => Number(a.classId));

    // Validate subjects
    const validSubjects = await prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
        schoolId,
      },
      select: { id: true },
    });

    if (validSubjects.length !== subjectIds.length) {
      return NextResponse.json(
        { error: "Invalid subject detected" },
        { status: 400 },
      );
    }

    // Validate classes
    const validClasses = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        schoolId,
      },
      select: { id: true },
    });

    if (validClasses.length !== classIds.length) {
      return NextResponse.json(
        { error: "Invalid class detected" },
        { status: 400 },
      );
    }

    // Replace inside transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.subjectTeacher.deleteMany({
        where: { teacherId, schoolId },
      });

      if (assignments.length > 0) {
        await tx.subjectTeacher.createMany({
          data: assignments.map((item: any) => ({
            teacherId,
            subjectId: Number(item.subjectId),
            classId: Number(item.classId),
            schoolId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.subjectTeacher.findMany({
        where: { teacherId, schoolId },
        include: { subject: true, class: true },
      });
    });

    return NextResponse.json(
      { message: "Assignments updated", data: result },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST teacher subjects error:", error);
    return NextResponse.json(
      { error: "Failed to update assignments" },
      { status: 500 },
    );
  }
}

/* ======================================================
   DELETE → Remove Single Assignment
====================================================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: teacherId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = Number(searchParams.get("subjectId"));
    const classId = Number(searchParams.get("classId"));

    if (!subjectId || !classId) {
      return NextResponse.json(
        { error: "subjectId and classId required" },
        { status: 400 },
      );
    }

    await prisma.subjectTeacher.deleteMany({
      where: {
        teacherId,
        subjectId,
        classId,
        schoolId,
      },
    });

    return NextResponse.json(
      { message: "Assignment removed" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE teacher subject error:", error);
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 },
    );
  }
}
