import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { bulkExamCSVSchema, examSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolId = await resolveSchoolId(context.params.schoolId);

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
    let inserted = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const rowNo = i + 2;

      const parsed = bulkExamCSVSchema.safeParse(rawRows[i]);
      if (!parsed.success) {
        errors.push({ row: rowNo, error: parsed.error.flatten() });
        continue;
      }

      const row = parsed.data;

      const grade = await prisma.grade.findUnique({
        where: {
          level_schoolId: {
            level: row.grade_level,
            schoolId,
          },
        },
      });

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
          error: "Invalid grade or subject",
        });
        continue;
      }

      /* Validate subject belongs to grade */
      const subjectBelongsToGrade = await prisma.subject.findFirst({
        where: {
          id: subject.id,
          schoolId,
          grades: { some: { id: grade.id } },
        },
      });

      if (!subjectBelongsToGrade) {
        errors.push({
          row: rowNo,
          error: "Subject not assigned to this grade",
        });
        continue;
      }

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

      const validated = examSchema.safeParse({
        title: exam.title,
        examDate: row.exam_date,
        startTime: row.start_time,
        gradeId: grade.id,
        subjectId: subject.id,
        maxMarks: row.max_marks,
      });

      if (!validated.success) {
        errors.push({
          row: rowNo,
          error: validated.error.flatten(),
        });
        continue;
      }

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
          date: new Date(validated.data.examDate),
          startTime: validated.data.startTime,
          maxMarks: validated.data.maxMarks,
        },
        create: {
          examId: exam.id,
          gradeId: grade.id,
          subjectId: subject.id,
          schoolId,
          date: new Date(validated.data.examDate),
          startTime: validated.data.startTime,
          maxMarks: validated.data.maxMarks,
        },
      });

      inserted++;
    }

    return NextResponse.json({
      success: errors.length === 0,
      inserted,
      errors,
    });

  } catch (error) {
    console.error("bulk exam error:", error);
    return NextResponse.json(
      { error: "Bulk upload failed" },
      { status: 500 }
    );
  }
}
