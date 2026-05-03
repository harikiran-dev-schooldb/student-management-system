import prisma from "../prisma";

export const fetchStudentFeeSummary = async (
  studentId: string,
  academicYearId: number,
  schoolId: string
) => {
  const totals = await prisma.studentTotalFees.findUnique({
    where: {
      studentId_academicYearId_schoolId: {
        studentId,
        academicYearId,
        schoolId,
      },
    },
    select: {
      totalPaidAmount: true,
      dueAmount: true,
    },
  });

  return {
    totalPaid: totals?.totalPaidAmount ?? 0,
    totalDue: totals?.dueAmount ?? 0,
  };
};