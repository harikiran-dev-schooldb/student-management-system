export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);
    const examTitle = searchParams.get("examTitle");
    const classIdParam = searchParams.get("classId");

    if (!examTitle || !classIdParam) {
      return NextResponse.json(
        { error: "examTitle and classId are required" },
        { status: 400 }
      );
    }

    const classId = Number(classIdParam);

    /* -----------------------------
       QUERY 1
       Class + Grade + Exam Subjects
    ------------------------------*/

    const classData = await db.class.findFirst({
      where: { id: classId, schoolId },
      select: {
        gradeId: true,
        Grade: {
          select: {
            examGradeSubjects: {
              where: {
                exam: {
                  title: examTitle,
                  schoolId,
                  academicYear: { isActive: true },
                },
              },
              select: {
                subject: {
                  select: { id: true, name: true },
                },
                maxMarks: true,
                examId: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const examSubjects = classData.Grade.examGradeSubjects;

    if (!examSubjects.length) {
      return NextResponse.json(
        { error: "Exam not configured for this grade" },
        { status: 404 }
      );
    }

    const examId = examSubjects[0].examId;

    const subjects = examSubjects.map((s) => ({
      id: s.subject.id,
      name: s.subject.name,
      maxMarks: s.maxMarks,
    }));

    /* -----------------------------
       QUERY 2
       Students + Results
    ------------------------------*/

    const students = await db.student.findMany({
      where: {
        schoolId,
        enrollments: {
          some: {
            classId,
            status: "ACTIVE",
            academicYear: { isActive: true },
          },
        },
      },
      select: {
        id: true,
        name: true,
        results: {
          where: {
            examId,
            schoolId,
          },
          select: {
            subjectId: true,
            marks: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const existingMarks: Record<string, Record<string, string>> = {};

    for (const student of students) {
      const map: Record<string, string> = {};

      for (const r of student.results) {
        const subj = subjects.find((s) => s.id === r.subjectId);
        if (subj) {
          map[subj.name] = String(r.marks);
        }
      }

      if (Object.keys(map).length) {
        existingMarks[student.id] = map;
      }
    }

    return NextResponse.json({
      examId,
      gradeId: classData.gradeId,
      classId,
      subjects,
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
      })),
      existingMarks,
    });

  } catch (error) {
    console.error("exam-data error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
