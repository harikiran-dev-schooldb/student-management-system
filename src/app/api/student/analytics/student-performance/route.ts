import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ---------------- Utility ---------------- */

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "Fail";
}

/* ---------------- API Handler ---------------- */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    }

    /* ---------------- Fetch Students ---------------- */

    const students = await prisma.student.findMany({
      where: {
        classId: Number(classId),
        status: "ACTIVE",
      },
      include: {
        results: {
          include: {
            Subject: true,
            Exam: true,
          },
        },
        attendances: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    /* ---------------- Build Performance ---------------- */

    const response = students.map((student) => {
      /* ---------- Attendance ---------- */
      const totalDays = student.attendances.length;
      const presentDays = student.attendances.filter(a => a.present).length;

      const attendancePercentage =
        totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      /* ---------- Subject-wise Marks ---------- */
      const subjectMap = new Map<
        string,
        { obtained: number; max: number }
      >();

      student.results.forEach((r) => {
        const subject = r.Subject.name;

        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { obtained: 0, max: 0 });
        }

        subjectMap.get(subject)!.obtained += r.marks;
        subjectMap.get(subject)!.max += 100; 
        // 👆 If you want exact max marks, we can fetch ExamGradeSubject later
      });

      const subjects = Array.from(subjectMap.entries()).map(
        ([subject, data]) => {
          const percentage =
            data.max > 0 ? (data.obtained / data.max) * 100 : 0;

          return {
            subject,
            obtained: data.obtained,
            max: data.max,
            percentage,
          };
        }
      );

      /* ---------- Overall ---------- */
      const totalObtained = subjects.reduce(
        (sum, s) => sum + s.obtained,
        0
      );
      const totalMax = subjects.reduce((sum, s) => sum + s.max, 0);

      const overallPercentage =
        totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      const grade = calculateGrade(overallPercentage);

      /* ---------- Risk Logic ---------- */
      const weakSubjects = subjects.filter(s => s.percentage < 50);
      const atRisk =
        overallPercentage < 50 || attendancePercentage < 65;

      return {
        student: {
          id: student.id,
          name: student.name,
          classId: student.classId,
        },
        overallPercentage,
        attendancePercentage,
        grade,
        subjects,
        atRisk,
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
