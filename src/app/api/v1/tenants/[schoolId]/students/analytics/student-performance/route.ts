import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ---------------- Utility ---------------- */

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "Fail";
}

/* ======================================================
   GET → Student Performance Analytics (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const examId = url.searchParams.get("examId");

    /* -----------------------------
       2️⃣ Authenticate User
    ------------------------------ */
    const user = await fetchUserInfo(schoolId);

    if (!user || !user.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       3️⃣ Role-Based Filtering
    ------------------------------ */
    let where: any = {
      schoolId, // 🔒 Tenant isolation
    };

    if (examId) {
      where.examId = Number(examId);
    }

    if (user.role === "student") {
      if (!user.studentId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      where.studentId = user.studentId;
    }

    else if (user.role === "teacher") {
      if (!user.classId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      where.Student = {
        is: {
          classId: user.classId,
          schoolId,
        },
      };
    }

    else if (user.role === "admin") {
      if (!classId) {
        return NextResponse.json(
          { error: "classId required" },
          { status: 400 }
        );
      }

      where.Student = {
        is: {
          classId: Number(classId),
          schoolId,
        },
      };
    }

    /* -----------------------------
       4️⃣ Fetch Results (Tenant Safe)
    ------------------------------ */
    const results = await prisma.result.findMany({
      where,
      include: {
        Student: {
          include: {
            Class: { select: { gradeId: true } },
            attendances: true,
          },
        },
        Subject: true,
        Exam: true,
      },
    });

    if (!results.length) {
      return NextResponse.json([]);
    }

    /* -----------------------------
       5️⃣ Fetch Max Marks
    ------------------------------ */
    const triplets = results.map((r) => ({
      examId: r.examId,
      subjectId: r.subjectId,
      gradeId: r.Student.Class.gradeId,
    }));

    const examGradeSubjects = await prisma.examGradeSubject.findMany({
      where: {
        schoolId, // 🔒 Tenant isolation
        OR: triplets.map((t) => ({
          examId: t.examId,
          subjectId: t.subjectId,
          gradeId: t.gradeId,
        })),
      },
    });

    const maxMarksMap = new Map<string, number>();
    for (const egs of examGradeSubjects) {
      maxMarksMap.set(
        `${egs.examId}-${egs.subjectId}-${egs.gradeId}`,
        egs.maxMarks
      );
    }

    /* -----------------------------
       6️⃣ Group By Student
    ------------------------------ */
    const studentMap = new Map<string, any>();

    for (const r of results) {
      const studentId = r.studentId;
      const gradeId = r.Student.Class.gradeId;

      const maxMarks =
        maxMarksMap.get(`${r.examId}-${r.subjectId}-${gradeId}`) ?? 100;

      if (!studentMap.has(studentId)) {
        const totalDays = r.Student.attendances.length;
        const presentDays = r.Student.attendances.filter(
          (a) => a.present
        ).length;

        studentMap.set(studentId, {
          student: {
            id: r.Student.id,
            name: r.Student.name,
            classId: r.Student.classId,
          },
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
          attendancePercentage:
            totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
        });
      }

      const studentData = studentMap.get(studentId);
      const percentage = (r.marks / maxMarks) * 100;

      studentData.subjects.push({
        subject: r.Subject.name,
        obtained: r.marks,
        max: maxMarks,
        percentage,
      });

      studentData.totalObtained += r.marks;
      studentData.totalMax += maxMarks;
    }

    /* -----------------------------
       7️⃣ Final Response
    ------------------------------ */
    const response = Array.from(studentMap.values()).map((s) => {
      const overallPercentage =
        s.totalMax > 0
          ? (s.totalObtained / s.totalMax) * 100
          : 0;

      return {
        student: s.student,
        overallPercentage,
        attendancePercentage: s.attendancePercentage,
        grade: calculateGrade(overallPercentage),
        subjects: s.subjects,
        atRisk:
          overallPercentage < 50 ||
          s.attendancePercentage < 65,
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Student Performance API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}