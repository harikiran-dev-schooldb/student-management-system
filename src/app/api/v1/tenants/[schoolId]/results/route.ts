export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SchoolNotFoundError } from "@/lib/resolveSchool";
import { Prisma } from "@prisma/client";
import { tenantSlugGuard } from "@/lib/tenantGuard";

/* ======================================================
   GET → Fetch Results (Tenant + Role Safe)
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* 1️⃣ Resolve tenant */
    const { schoolId: schoolSlug } = await params;

    const url = new URL(req.url);

    const examId = url.searchParams.get("examId");
    const gradeId = url.searchParams.get("gradeId");
    const classId = url.searchParams.get("classId");
    const studentId = url.searchParams.get("studentId");

    const { access, error } = await tenantSlugGuard(schoolSlug);
    if (error) return error;

    const schoolId = access.schoolId;


    const where: Prisma.ResultWhereInput = { schoolId };

    /* =============================
       STUDENT → only own results
    ============================= */

    if (access.role === "student") {
      if (!examId || !access.studentId) {
        return NextResponse.json({ error: "Exam required" }, { status: 400 });
      }

      where.studentId = access.studentId;
      where.examId = Number(examId);
    }

    /* =============================
       TEACHER → only class students
    ============================= */

    else if (access.role === "teacher") {
      if (!examId || !access.classId) {
        return NextResponse.json({ error: "Exam required" }, { status: 400 });
      }

      where.examId = Number(examId);

      where.student = {
        is: {
          enrollments: {
            some: {
              classId: access.classId,
              status: "ACTIVE",
              schoolId,
            },
          },
        },
      };
    }

    /* =============================
       ADMIN → flexible filters
    ============================= */

    else if (access.role === "admin") {
      if (studentId) {
        where.studentId = studentId;
      }

      if (examId) {
        where.examId = Number(examId);
      }

      if (classId) {
        where.student = {
          is: {
            enrollments: {
              some: {
                classId: Number(classId),
                schoolId,
              },
            },
          },
        };
      }

      if (gradeId) {
        where.student = {
          is: {
            enrollments: {
              some: {
                class: {
                  gradeId: Number(gradeId),
                },
                schoolId,
              },
            },
          },
        };
      }
    }

    /* =============================
       Fetch Results
    ============================= */

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNo: true,
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                class: {
                  select: {
                    id: true,
                    gradeId: true,
                  },
                },
              },
            },
          },
        },
        subject: true,
        exam: true,
      },
    });

    /* =============================
       Resolve Max Marks
    ============================= */

    const triplets = results.map((r) => ({
      examId: r.examId,
      subjectId: r.subjectId,
      gradeId: r.student.enrollments[0]?.class.gradeId,
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

    const resultsWithMaxMarks = results.map((r) => {
      const gradeId = r.student.enrollments[0]?.class.gradeId;

      return {
        ...r,
        maxMarks:
          maxMarksMap.get(`${r.examId}-${r.subjectId}-${gradeId}`) ?? 100,
      };
    });

    return NextResponse.json(
      { results: resultsWithMaxMarks },
      { status: 200 },
    );
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