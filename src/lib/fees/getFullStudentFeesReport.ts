import prisma from "@/lib/prisma";
import { calculateStudentFeeReport } from "@/lib/fees/feeUtils";

export async function getFullStudentFeesReport(
  schoolId: string,
  academicYear?: string
) {
  const whereClause: any = {
    schoolId,
    status: "ACTIVE",
  };

  if (academicYear) {
    whereClause.academicYear = academicYear;
  }

  const students = await prisma.student.findMany({
    where: whereClause,
    include: {
      Class: {
        select: {
          name: true,
        },
      },
      totalFees: true,
      studentFees: {
        include: {
          feeStructure: true,
        },
      },
    },
  });

  return students.map((student) =>
    calculateStudentFeeReport({
      ...student,
      Class: { name: student.Class?.name ?? "-" },
    })
  );
}