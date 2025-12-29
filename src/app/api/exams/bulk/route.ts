import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { BulkExamCSVRow, bulkExamCSVSchema, examSchema } from "@/lib/formValidationSchemas";

export async function POST(req: Request) {
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

    /* -----------------------------
       1. CSV validation (Zod)
    ------------------------------*/
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
       2. Resolve Grade & Subject
    ------------------------------*/
    const grade = await prisma.grade.findUnique({
      where: { level: row.grade_level },
    });

    const subject = await prisma.subject.findUnique({
      where: { name: row.subject_name },
    });

    if (!grade || !subject) {
      errors.push({
        row: rowNo,
        error: "Invalid grade or subject",
      });
      continue;
    }

    /* -----------------------------
       3. Ensure Exam exists
    ------------------------------*/
    const exam = await prisma.exam.upsert({
      where: { title: row.exam_title },
      update: {},
      create: { title: row.exam_title },
    });

    /* -----------------------------
       4. Final schema validation
       (reusing your examSchema)
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
       5. Insert (idempotent)
    ------------------------------*/
    await prisma.examGradeSubject.upsert({
      where: {
        examId_gradeId_subjectId: {
          examId: exam.id,
          gradeId: grade.id,
          subjectId: subject.id,
        },
      },
      update: {
        date: finalExam.data.examDate,
        startTime: finalExam.data.startTime,
        maxMarks: finalExam.data.maxMarks,
      },
      create: {
        examId: exam.id,
        gradeId: grade.id,
        subjectId: subject.id,
        date: finalExam.data.examDate,
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
