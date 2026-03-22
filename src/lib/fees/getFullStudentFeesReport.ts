import prisma from "@/lib/prisma";
import { calculateStudentFeeReport } from "@/lib/fees/feeUtils";

export async function getFullStudentFeesReport(
  schoolId: string,
  academicYearId?: number
) {
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      status: "ACTIVE",
    },

    select: {
      id: true,
      name: true,
      admissionNo: true,
      fatherName: true,
      phone: true,

      enrollments: {
        where: academicYearId
          ? { academicYearId }
          : undefined,
        select: {
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
      studentFees: {
        where: academicYearId
          ? { academicYearId }
          : undefined,
        select: {
          paidAmount: true,
          discountAmount: true,
          fineAmount: true,
          feeStructure: {
            select: {
              termFees: true,
              abacusFees: true,
            },
          },
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
