import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { requireTenantAccess } from "@/lib/requireTenantAccess";
import { Prisma } from "@prisma/client";

/* ======================================================
   GET → Fetch Results (Tenant + Role Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------
       1️⃣ Resolve Tenant
    -------------------------------- */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -------------------------------
       2️⃣ Parse Query Params
    -------------------------------- */
    const url = new URL(req.url);
    const examId = url.searchParams.get("examId");
    const gradeId = url.searchParams.get("gradeId");
    const classId = url.searchParams.get("classId");
    const studentId = url.searchParams.get("studentId");

    /* -------------------------------
       3️⃣ Get Current User
    -------------------------------- */
    const access = await requireTenantAccess();

    if (access.schoolId !== schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!access?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* -------------------------------
       4️⃣ Build Tenant-Safe Filter
    -------------------------------- */
    const where: Prisma.ResultWhereInput = { schoolId };

    // STUDENT → Only own results
    if (access.role === "student") {
      const myStudentId = access.studentId;

      if (!examId || !myStudentId) {
        return NextResponse.json({ error: "Exam required" }, { status: 400 });
      }

      const parsedExamId = examId ? Number(examId) : undefined;

      if (examId && Number.isNaN(parsedExamId)) {
        return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
      }
      where.studentId = myStudentId;
    }

    // TEACHER → Only their class
    else if (access.role === "teacher") {
      if (!examId || !access.classId) {
        return NextResponse.json({ error: "Exam required" }, { status: 400 });
      }

      const parsedExamId = examId ? Number(examId) : undefined;

      if (examId && Number.isNaN(parsedExamId)) {
        return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
      }
      where.Student = {
        is: {
          classId: access.classId,
        },
      };
    }

    // ADMIN → Flexible filtering
    else if (access.role === "admin") {
      if (studentId) {
        where.studentId = studentId;
      } else if (examId && gradeId && classId) {
        const parsedExamId = examId ? Number(examId) : undefined;

        if (examId && Number.isNaN(parsedExamId)) {
          return NextResponse.json(
            { error: "Invalid examId" },
            { status: 400 },
          );
        }
        where.Student = {
          is: {
            Class: {
              is: {
                id: Number(classId),
                gradeId: Number(gradeId),
              },
            },
          },
        };
      } else if (examId) {
        where.examId = Number(examId);
      }
    }

    /* -------------------------------
       5️⃣ Fetch Results
    -------------------------------- */
    const results = await prisma.result.findMany({
      where,
      include: {
        Student: {
          include: {
            Class: {
              select: { gradeId: true },
            },
          },
        },
        Subject: true,
        Exam: true,
      },
    });

    /* -------------------------------
       6️⃣ Resolve Max Marks
    -------------------------------- */
    const triplets = results.map((r) => ({
      examId: r.examId,
      subjectId: r.subjectId,
      gradeId: r.Student.Class.gradeId,
    }));

    const examGradeSubjects =
      triplets.length > 0
        ? await prisma.examGradeSubject.findMany({
            where: { OR: triplets },
          })
        : [];

    const maxMarksMap = new Map<string, number>();

    examGradeSubjects.forEach((egs) => {
      maxMarksMap.set(
        `${egs.examId}-${egs.subjectId}-${egs.gradeId}`,
        egs.maxMarks,
      );
    });

    const resultsWithMaxMarks = results.map((r) => ({
      ...r,
      maxMarks:
        maxMarksMap.get(
          `${r.examId}-${r.subjectId}-${r.Student.Class.gradeId}`,
        ) ?? 100,
    }));

    return NextResponse.json({ results: resultsWithMaxMarks }, { status: 200 });
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Results GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 },
    );
  }
}
