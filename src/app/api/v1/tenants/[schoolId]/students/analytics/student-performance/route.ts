export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

/* ---------------- Utility ---------------- */

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
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
    /* ---------------- Setup ---------------- */

    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const url = new URL(req.url);
    const examId = url.searchParams.get("examId");
    const classId = url.searchParams.get("classId");

    const user = await fetchUserInfo(slug);

    if (!user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = { schoolId };

    if (examId) where.examId = Number(examId);

    /* ---------------- Role Filters ---------------- */

    if (user.role === "student") {
      if (!user.studentId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.studentId = user.studentId;
    }

    else if (user.role === "teacher") {
      const targetClassId = classId
        ? Number(classId)
        : user.classId;

      if (!targetClassId) {
        return NextResponse.json(
          { error: "No class assigned" },
          { status: 400 }
        );
      }

      where.student = {
        is: {
          enrollments: {
            some: {
              classId: targetClassId,
              schoolId,
              status: "ACTIVE",
              academicYearId: 1,
            },
          },
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

      where.student = {
        is: {
          enrollments: {
            some: {
              classId: Number(classId),
              schoolId,
              status: "ACTIVE",
              academicYearId: 1,
            },
          },
        },
      };
    }

    /* ---------------- Fetch Results ---------------- */

    const results = await db.result.findMany({
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

    /* ---------------- Attendance Calculation ---------------- */

    const studentIds = [...new Set(results.map(r => r.studentId))];

    // total attendance records
    const totalAttendance = await db.attendance.groupBy({
      by: ["studentId"],
      where: {
        schoolId,
        studentId: { in: studentIds },
        academicYearId: 1,
      },
      _count: {
        studentId: true,
      },
    });

    // present attendance records
    const presentAttendance = await db.attendance.groupBy({
      by: ["studentId"],
      where: {
        schoolId,
        studentId: { in: studentIds },
        academicYearId: 1,
        present: true, // ✅ filter instead of sum
      },
      _count: {
        studentId: true,
      },
    });

    const attendanceMap = new Map<string, number>();

    const presentMap = new Map(
      presentAttendance.map((p) => [p.studentId, p._count.studentId])
    );

    for (const t of totalAttendance) {
      const total = t._count.studentId || 0;
      const present = presentMap.get(t.studentId) || 0;

      const percentage = total > 0 ? (present / total) * 100 : 0;

      attendanceMap.set(t.studentId, percentage);
    }
    /* ---------------- Resolve maxMarks ---------------- */

    const triplets: {
      examId: number;
      subjectId: number;
      gradeId: number;
    }[] = [];

    for (const r of results) {
      const enrollment = r.student.enrollments.find(
        (e) => e.class?.gradeId
      );

      if (!enrollment?.class?.gradeId) continue;

      triplets.push({
        examId: r.examId,
        subjectId: r.subjectId,
        gradeId: enrollment.class.gradeId,
      });
    }

    const uniqueTriplets = Array.from(
      new Map(
        triplets.map((t) => [
          `${t.examId}-${t.subjectId}-${t.gradeId}`,
          t,
        ])
      ).values()
    );

    const examGradeSubjects = await db.examGradeSubject.findMany({
      where: {
        schoolId,
        OR: uniqueTriplets,
      },
    });

    const maxMarksMap = new Map<string, number>();

    for (const egs of examGradeSubjects) {
      const key = `${egs.examId}-${egs.subjectId}-${egs.gradeId}`;
      maxMarksMap.set(key, egs.maxMarks);
    }

    /* ---------------- Group by student ---------------- */

    const studentMap = new Map<string, any>();

    for (const r of results) {
      const enrollment = r.student.enrollments.find(
        (e) => e.class?.gradeId
      );

      const gradeId = enrollment?.class?.gradeId;
      const classId = enrollment?.class?.id;

      const key = `${r.examId}-${r.subjectId}-${gradeId}`;
      const maxMarks = gradeId
        ? maxMarksMap.get(key) ?? 100
        : 100;

      if (!studentMap.has(r.studentId)) {
        studentMap.set(r.studentId, {
          student: {
            id: r.student.id,
            name: r.student.name,
            admissionNo: r.student.admissionNo,
            classId,
          },
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
          attendancePercentage: attendanceMap.get(r.studentId) ?? 0,
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

    /* ---------------- Final Response ---------------- */

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