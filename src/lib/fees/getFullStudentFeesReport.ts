import prisma from "@/lib/prisma";
import { calculateStudentFeeReport } from "@/lib/fees/feeUtils";

export async function getFullStudentFeesReport(
  schoolId: string,
  academicYearId?: string
) {
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      status: "ACTIVE",
    },

    include: {
      enrollments: {
        where: academicYearId
          ? { academicYearId }
          : undefined,
        include: {
          class: {
            select: {
              name: true,
              section: true,
              Grade: {
                select: {
                  level: true,
                },
              },
            },
          },
        },
        take: 1,
      },

      totalFees: academicYearId
        ? {
            where: { academicYearId },
          }
        : true,

      studentFees: {
        where: academicYearId
          ? { academicYearId }
          : undefined,
        include: {
          feeStructure: true,
        },
      },
    },
  });

  return students.map((student) => {
    const enrollment = student.enrollments[0];

    return calculateStudentFeeReport({
      ...student,

      Class: enrollment
        ? {
            name: `${enrollment.class.Grade.level}-${enrollment.class.section}`,
          }
        : { name: "-" },
    });
  });
}
