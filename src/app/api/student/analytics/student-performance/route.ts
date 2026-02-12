import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextResponse } from "next/server";

/* ---------------- Utility ---------------- */

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "Fail";
}

/* ---------------- API Handler ---------------- */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const examId = url.searchParams.get("examId");

    const user = await fetchUserInfo();
    if (!user.role)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


    /* ---------------- Role-Based Filtering ---------------- */

    let where: any = {};

    if (user.role === "student") {
      const myStudentId = user.students?.[0]?.studentId;

      if (!myStudentId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      where = {
        studentId: myStudentId,
      };
    } else if (user.role === "teacher") {
      const myClassId = user.classId;

      if (!myClassId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      where = {
        Student: { is: { classId: myClassId } },
      };
    } else if (user.role === "admin") {
      if (!classId)
        return NextResponse.json(
          { error: "classId required" },
          { status: 400 },
        );

      where = {
        Student: { is: { classId: Number(classId) } },
      };
    }

    /* ---------------- Fetch Results ---------------- */

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

    /* ---------------- Fetch Max Marks ---------------- */

    const triplets = results.map((r) => ({
      examId: r.examId,
      subjectId: r.subjectId,
      gradeId: r.Student.Class.gradeId,
    }));

    const examGradeSubjects = await prisma.examGradeSubject.findMany({
      where: {
        OR: triplets.map((t) => ({
          examId: t.examId,
          subjectId: t.subjectId,
          gradeId: t.gradeId,
        })),
      },
    });

    const maxMarksMap = new Map<string, number>();
    for (const egs of examGradeSubjects) {
      const key = `${egs.examId}-${egs.subjectId}-${egs.gradeId}`;
      maxMarksMap.set(key, egs.maxMarks);
    }

    /* ---------------- Group By Student ---------------- */

    const studentMap = new Map<string, any>();

    for (const r of results) {
      const studentId = r.studentId;
      const gradeId = r.Student.Class.gradeId;

      const maxMarks =
        maxMarksMap.get(`${r.examId}-${r.subjectId}-${gradeId}`) ?? 100;

      if (!studentMap.has(studentId)) {
        const totalDays = r.Student.attendances.length;
        const presentDays = r.Student.attendances.filter(
          (a) => a.present,
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

    /* ---------------- Final Response Build ---------------- */

    const response = Array.from(studentMap.values()).map((s) => {
      const overallPercentage =
        s.totalMax > 0 ? (s.totalObtained / s.totalMax) * 100 : 0;

      const grade = calculateGrade(overallPercentage);

      const atRisk = overallPercentage < 50 || s.attendancePercentage < 65;

      return {
        student: s.student,
        overallPercentage,
        attendancePercentage: s.attendancePercentage,
        grade,
        subjects: s.subjects,
        atRisk,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Student Performance API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
