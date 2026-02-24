import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   PUT → Update Subject (Admin Only)
====================================================== */
export async function PUT(
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

    const user = await fetchUserInfo(slug);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, gradeId } = body;

    if (!name || !Array.isArray(gradeId) || gradeId.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    /* -----------------------------
       Ensure Subject Exists
    ------------------------------ */
    const existingSubject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      select: { id: true },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       Duplicate Name Check
    ------------------------------ */
    const duplicate = await prisma.subject.findUnique({
      where: {
        name_schoolId: {
          name: trimmedName,
          schoolId,
        },
      },
    });

    if (duplicate && duplicate.id !== subjectId) {
      return NextResponse.json(
        { error: `Subject "${trimmedName}" already exists.` },
        { status: 409 }
      );
    }

    /* -----------------------------
       Validate Grades
    ------------------------------ */
    const validGrades = await prisma.grade.findMany({
      where: {
        id: { in: gradeId.map(Number) },
        schoolId,
      },
      select: { id: true },
    });

    if (validGrades.length !== gradeId.length) {
      return NextResponse.json(
        { error: "Some grade IDs are invalid." },
        { status: 400 }
      );
    }

    /* -----------------------------
       Update Subject
    ------------------------------ */
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: trimmedName,
        grades: {
          set: validGrades.map(g => ({ id: g.id })),
        },
      },
      include: { grades: true },
    });

    return NextResponse.json(updatedSubject, { status: 200 });

  } catch (error: any) {
    console.error("Subject PUT error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate subject." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


/* ======================================================
   DELETE → Remove Subject (Admin Only)
====================================================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId: schoolSlug, id: subjectIdStr } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const subjectId = Number(subjectIdStr);

    if (isNaN(subjectId)) {
      return NextResponse.json(
        { error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const user = await fetchUserInfo(schoolSlug);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* -----------------------------
       Check Dependencies
    ------------------------------ */
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      select: {
        _count: {
          select: {
            results: true,
            lessons: true,
            examGradeSubjects: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    const hasDependencies =
      subject._count.results > 0 ||
      subject._count.lessons > 0 ||
      subject._count.examGradeSubjects > 0;

    if (hasDependencies) {
      return NextResponse.json(
        { error: "Cannot delete subject with dependent records." },
        { status: 400 }
      );
    }

    /* -----------------------------
       Clean Relations + Delete
    ------------------------------ */
    await prisma.$transaction(async (tx) => {

      await tx.subjectTeacher.deleteMany({
        where: { subjectId, schoolId },
      });

      await tx.subject.update({
        where: { id: subjectId },
        data: { grades: { set: [] } },
      });

      await tx.subject.delete({
        where: { id: subjectId },
      });
    });

    return NextResponse.json(
      { success: true, message: "Subject deleted successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Subject DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}