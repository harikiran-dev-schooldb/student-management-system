import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const examId = url.searchParams.get("examId");
  const gradeId = url.searchParams.get("gradeId");
  const classId = url.searchParams.get("classId");
  const studentId = url.searchParams.get("studentId");

  // 1️⃣ Get current user info
  const user = await fetchUserInfo();
  if (!user.role)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let where: any = {};

  // 2️⃣ STUDENT: can only see their own results
  if (user.role === "student") {
    const myStudentId = user.students?.[0]?.studentId;
    if (!examId || !myStudentId)
      return NextResponse.json({ error: "Exam required" }, { status: 400 });
    where = {
      examId: Number(examId),
      studentId: myStudentId,
    };
  }

  // 3️⃣ TEACHER: can only see their class results
  else if (user.role === "teacher") {
    const myClassId = user.classId;
    if (!examId || !myClassId)
      return NextResponse.json({ error: "Exam required" }, { status: 400 });
    where = {
      examId: Number(examId),
      Student: { is: { classId: myClassId } },
    };
  }

  // 4️⃣ ADMIN: can filter freely
  else if (user.role === "admin") {
    if (studentId) where = { studentId };
    else if (examId && gradeId && classId)
      where = {
        examId: Number(examId),
        Student: {
          is: {
            Class: { is: { id: Number(classId), gradeId: Number(gradeId) } },
          },
        },
      };
    else if (examId) where = { examId: Number(examId) };
  }

  // 5️⃣ Fetch results
  const results = await prisma.result.findMany({
    where,
    include: {
      Student: { include: { Class: { select: { gradeId: true } } } },
      Subject: true,
      Exam: true,
    },
  });

  // 6️⃣ Merge maxMarks like before
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

  const resultsWithMaxMarks = results.map((r) => ({
    ...r,
    maxMarks:
      maxMarksMap.get(
        `${r.examId}-${r.subjectId}-${r.Student.Class.gradeId}`
      ) ?? 100,
  }));

  return NextResponse.json({ results: resultsWithMaxMarks });
}
