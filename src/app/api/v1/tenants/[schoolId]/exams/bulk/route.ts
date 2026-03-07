export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { bulkExamCSVSchema, examSchema } from "@/lib/formValidationSchemas";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const db = tenantPrisma(schoolId);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
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

    /* ---------------------------------------------------
       Resolve Active Academic Year (once)
    --------------------------------------------------- */
    const activeYear = await db.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------
       Preload Grades & Subjects (avoid N+1 queries)
    --------------------------------------------------- */

    const grades = await db.grade.findMany({
      where: { schoolId },
      select: { id: true, level: true },
    });

    const gradeMap = new Map(grades.map((g) => [g.level, g]));

    const subjects = await db.subject.findMany({
      where: { schoolId },
      include: { grades: { select: { id: true } } },
    });

    const subjectMap = new Map(subjects.map((s) => [s.name, s]));

    /* ---------------------------------------------------
       Process CSV Rows
    --------------------------------------------------- */

    for (let i = 0; i < rawRows.length; i++) {
      const rowNo = i + 2;

      const parsed = bulkExamCSVSchema.safeParse(rawRows[i]);
      if (!parsed.success) {
        errors.push({ row: rowNo, error: parsed.error.flatten() });
        continue;
      }

      const row = parsed.data;

      const grade = gradeMap.get(row.grade_level);
      const subject = subjectMap.get(row.subject_name);

      if (!grade || !subject) {
        errors.push({
          row: rowNo,
          error: "Invalid grade or subject",
        });
        continue;
      }

      /* Validate subject belongs to grade */
      const subjectBelongsToGrade = subject.grades.some(
        (g) => g.id === grade.id
      );

      if (!subjectBelongsToGrade) {
        errors.push({
          row: rowNo,
          error: "Subject not assigned to this grade",
        });
        continue;
      }

      /* Upsert Exam */
      const exam = await db.exam.upsert({
        where: {
          title_academicYearId_schoolId: {
            title: row.exam_title,
            schoolId,
            academicYearId: activeYear.id,
          },
        },
        update: {},
        create: {
          title: row.exam_title,
          schoolId,
          academicYearId: activeYear.id,
        },
      });

      /* Validate Exam Entry */
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

      /* Upsert Exam Schedule */
      await db.examGradeSubject.upsert({
        where: {
          examId_gradeId_subjectId_academicYearId_schoolId: {
            examId: exam.id,
            gradeId: grade.id,
            subjectId: subject.id,
            academicYearId: activeYear.id,
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
          academicYearId: activeYear.id,
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