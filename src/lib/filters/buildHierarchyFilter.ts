import { Prisma } from "@prisma/client";

export const parseParam = (param: any) =>
  Array.isArray(param) ? param[0] : param;

/* ---------------- BRANCH → GRADE → CLASS ---------------- */

export function buildClassHierarchyFilter({
  branchId,
  gradeId,
  classId,
}: {
  branchId?: any;
  gradeId?: any;
  classId?: any;
}): Prisma.ClassWhereInput {
  const branch = Number(parseParam(branchId));
  const grade = Number(parseParam(gradeId));
  const cls = Number(parseParam(classId));

  return {
    ...(cls && { id: cls }),

    ...(grade && { gradeId: grade }),

    ...(branch && {
      Grade: {
        branchId: branch,
      },
    }),
  };
}

/* ---------------- STUDENT ENROLLMENT FILTER ---------------- */

export function buildEnrollmentFilter({
  branchId,
  gradeId,
  classId,
}: {
  branchId?: any;
  gradeId?: any;
  classId?: any;
}): Prisma.StudentEnrollmentWhereInput {
  const classFilter = buildClassHierarchyFilter({
    branchId,
    gradeId,
    classId,
  });

  return {
    ...(classId && { classId: Number(parseParam(classId)) }),

    ...(Object.keys(classFilter).length && {
      class: classFilter,
    }),
  };
}

/* ---------------- EXAM FILTER ---------------- */

export function buildExamGradeFilter({
  branchId,
  gradeId,
}: {
  branchId?: any;
  gradeId?: any;
}): Prisma.ExamGradeSubjectWhereInput {
  const branch = Number(parseParam(branchId));
  const grade = Number(parseParam(gradeId));

  const gradeFilter: any = {};

  if (grade) gradeFilter.id = grade;
  if (branch) gradeFilter.branchId = branch;

  return Object.keys(gradeFilter).length
    ? { grade: gradeFilter }
    : {};
}

export function buildGradeFilter({
  branchId,
  gradeId,
}: {
  branchId?: any;
  gradeId?: any;
}): Prisma.GradeWhereInput {
  const branch = Number(parseParam(branchId));
  const grade = Number(parseParam(gradeId));

  return {
    ...(grade && { id: grade }),
    ...(branch && { branchId: branch }),
  };
}

export function buildStudentWhereFromEnrollment({
  branchId,
  gradeId,
  classId,
}: {
  branchId?: any;
  gradeId?: any;
  classId?: any;
}): Prisma.StudentWhereInput {
  const enrollmentFilter = buildEnrollmentFilter({
    branchId,
    gradeId,
    classId,
  });

  return Object.keys(enrollmentFilter).length
    ? {
        enrollments: {
          some: enrollmentFilter,
        },
      }
    : {};
}