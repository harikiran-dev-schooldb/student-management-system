export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ---------------- Utility ---------------- */

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "Fail";
}

/* ======================================================
   GET → Student Performance Analytics
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const url = new URL(req.url);
    const examId = url.searchParams.get("examId");
    const classId = url.searchParams.get("classId");

    const user = await fetchUserInfo(schoolSlug);

    if (!user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = { schoolId };

    if (examId) where.examId = Number(examId);

    /* =========================
       STUDENT
    ========================= */

    if (user.role === "student") {
      if (!user.studentId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      where.studentId = user.studentId;
    }

    /* =========================
       TEACHER
    ========================= */

    else if (user.role === "teacher") {
      if (!user.classId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      where.student = {
        is: {
          enrollments: {
            some: {
              classId: user.classId,
              schoolId,
              status: "ACTIVE",
            },
          },
        },
      };
    }

    /* =========================
       ADMIN
    ========================= */

    else if (user.role === "admin") {
      if (!classId) {
        return NextResponse.json(
          { error: "classId required" },
          { status: 400 }
        );
      }

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

    /* =========================
       Fetch Results
    ========================= */

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                class: {
                  select: { id: true, gradeId: true },
                },
              },
            },
          },
        },
        subject: true,
      },
    });

    if (!results.length) {
      return NextResponse.json([]);
    }

    /* =========================
       Resolve max marks
    ========================= */

    const triplets = results.map((r) => ({
      examId: r.examId,
      subjectId: r.subjectId,
      gradeId: r.student.enrollments[0]?.class.gradeId,
    }));

    const examGradeSubjects = await prisma.examGradeSubject.findMany({
      where: { schoolId, OR: triplets },
    });

    const maxMarksMap = new Map<string, number>();

    examGradeSubjects.forEach((egs) => {
      maxMarksMap.set(
        `${egs.examId}-${egs.subjectId}-${egs.gradeId}`,
        egs.maxMarks
      );
    });

    /* =========================
       Group by student
    ========================= */

    const studentMap = new Map<string, any>();

    for (const r of results) {
      const gradeId = r.student.enrollments[0]?.class.gradeId;
      const classId = r.student.enrollments[0]?.class.id;

      const maxMarks =
        maxMarksMap.get(`${r.examId}-${r.subjectId}-${gradeId}`) ?? 100;

      if (!studentMap.has(r.studentId)) {
        studentMap.set(r.studentId, {
          student: {
            id: r.student.id,
            name: r.student.name,
            classId,
          },
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
        });
      }

      const studentData = studentMap.get(r.studentId);

      const percentage = (r.marks / maxMarks) * 100;

      studentData.subjects.push({
        subject: r.subject.name,
        obtained: r.marks,
        max: maxMarks,
        percentage,
      });

      studentData.totalObtained += r.marks;
      studentData.totalMax += maxMarks;
    }

    /* =========================
       Final response
    ========================= */

    const response = Array.from(studentMap.values()).map((s) => {
      const overallPercentage =
        s.totalMax > 0 ? (s.totalObtained / s.totalMax) * 100 : 0;

      return {
        student: s.student,
        overallPercentage,
        grade: calculateGrade(overallPercentage),
        subjects: s.subjects,
        atRisk: overallPercentage < 50,
      };
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error("Student Performance API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}