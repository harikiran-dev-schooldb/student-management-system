import { Prisma } from "@prisma/client";

export function buildStudentFilter({
  search,
  classId,
  gradeId,
  branchId,
}: {
  search?: string | null;
  classId?: string | null;
  gradeId?: string | null;
  branchId?: string | null;
}): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {};

  /* 🔍 Search */
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  /* 🎯 Hierarchy Filters */
  if (classId) {
    where.enrollments = {
      some: {
        classId: Number(classId),
      },
    };
  } else if (gradeId) {
    where.enrollments = {
      some: {
        class: {
          gradeId: Number(gradeId),
        },
      },
    };
  } else if (branchId) {
    where.enrollments = {
      some: {
        class: {
          Grade: {
            branchId: Number(branchId),
          },
        },
      },
    };
  }

  return where;
}