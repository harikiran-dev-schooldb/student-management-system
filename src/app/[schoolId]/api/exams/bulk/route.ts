import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import {
  BulkExamCSVRow,
  bulkExamCSVSchema,
  examSchema,
} from "@/lib/formValidationSchemas";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId } = await context.params;

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "CSV file is required" },
      { status: 400 }
    );
  }

  const csvText = await file.text();

  const rawRows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as unknown[];

  const errors: any[] = [];
  const inserted: any[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNo = i + 2;

    const parsed = bulkExamCSVSchema.safeParse(rawRows[i]);

    if (!parsed.success) {
      errors.push({
        row: rowNo,
        error: parsed.error.flatten().fieldErrors,
      });
      continue;
    }

    const row: BulkExamCSVRow = parsed.data;

    /* -----------------------------
       1️⃣ Resolve Grade (tenant-safe)
    ------------------------------*/
    const grade = await prisma.grade.findUnique({
      where: {
        level_schoolId: {
          level: row.grade_level,
          schoolId,
        },
      },
    });

    /* -----------------------------
       2️⃣ Resolve Subject (tenant-safe)
    ------------------------------*/
    const subject = await prisma.subject.findUnique({
      where: {
        name_schoolId: {
          name: row.subject_name,
          schoolId,
        },
      },
    });

    if (!grade || !subject) {
      errors.push({
        row: rowNo,
        error: "Invalid grade or subject for this school",
      });
      continue;
    }

    /* -----------------------------
       3️⃣ Ensure Exam exists (per school)
    ------------------------------*/
    const exam = await prisma.exam.upsert({
      where: {
        title_schoolId: {
          title: row.exam_title,
          schoolId,
        },
      },
      update: {},
      create: {
        title: row.exam_title,
        schoolId,
      },
    });

    /* -----------------------------
       4️⃣ Final schema validation
    ------------------------------*/
    const finalExam = examSchema.safeParse({
      title: exam.title,
      examDate: row.exam_date,
      startTime: row.start_time,
      gradeId: grade.id,
      subjectId: subject.id,
      maxMarks: row.max_marks,
    });

    if (!finalExam.success) {
      errors.push({
        row: rowNo,
        error: finalExam.error.flatten().fieldErrors,
      });
      continue;
    }

    /* -----------------------------
       5️⃣ Upsert ExamGradeSubject
    ------------------------------*/
    await prisma.examGradeSubject.upsert({
      where: {
        examId_gradeId_subjectId_schoolId: {
          examId: exam.id,
          gradeId: grade.id,
          subjectId: subject.id,
          schoolId,
        },
      },
      update: {
        date: new Date(finalExam.data.examDate),
        startTime: finalExam.data.startTime,
        maxMarks: finalExam.data.maxMarks,
      },
      create: {
        examId: exam.id,
        gradeId: grade.id,
        subjectId: subject.id,
        schoolId,
        date: new Date(finalExam.data.examDate),
        startTime: finalExam.data.startTime,
        maxMarks: finalExam.data.maxMarks,
      },
    });

    inserted.push({
      exam: exam.title,
      grade: row.grade_level,
      subject: row.subject_name,
    });
  }

  return NextResponse.json({
    success: errors.length === 0,
    inserted: inserted.length,
    errors,
  });
}
