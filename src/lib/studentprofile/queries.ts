import prisma from "../prisma";

export const fetchStudentFeeSummary = async (
  studentId: string,
  academicYearId: string
) => {
  /* ---------------- Payments ---------------- */

  const transactions = await prisma.feeTransaction.findMany({
    where: {
      studentId,
      academicYearId,
      deletedAt: null,
    },
    select: {
      amount: true,
    },
  });

  const totalPaid = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  /* ---------------- Student Enrollment ---------------- */

  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      academicYearId,
      status: "ACTIVE",
    },
    include: {
      class: {
        include: {
          Grade: true,
        },
      },
    },
  });

  if (!enrollment) {
    return { totalPaid, totalDue: 0 };
  }

  const gradeId = enrollment.class.gradeId;

  /* ---------------- Fee Structure ---------------- */

  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      gradeId,
      academicYearId,
    },
    select: {
      termFees: true,
      abacusFees: true,
    },
  });

  const totalDue = feeStructures.reduce((sum, fs) => {
    return sum + (fs.termFees ?? 0) + (fs.abacusFees ?? 0);
  }, 0);

  return {
    totalPaid,
    totalDue,
  };
};
