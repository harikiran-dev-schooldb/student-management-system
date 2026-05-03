import prisma from "@/lib/prisma";

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
        where: academicYearId ? { academicYearId } : undefined,
        select: {
          class: {
            select: {
              name: true,
              section: true,
              Grade: {
                select: { level: true },
              },
            },
          },
        },
        take: 1,
      },

      studentFees: {
        where: academicYearId ? { academicYearId } : undefined,
        select: {
          paidAmount: true,
          discountAmount: true,
          fineAmount: true,
          dueAmount: true, // ✅ IMPORTANT
          feeStructure: {
            select: {
              amount: true, // ✅ NEW FIELD
            },
          },
        },
      },
    },
  });

  return students.map((student) => {
    const enrollment = student.enrollments[0];

    let totalFee = 0;
    let totalPaid = 0;
    let totalDiscount = 0;
    let totalFine = 0;
    let totalDue = 0;

    for (const fee of student.studentFees) {
      totalFee += fee.feeStructure?.amount ?? 0;
      totalPaid += fee.paidAmount ?? 0;
      totalDiscount += fee.discountAmount ?? 0;
      totalFine += fee.fineAmount ?? 0;
      totalDue += fee.dueAmount ?? 0;
    }

    let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";
    if (totalDue <= 0) status = "Paid";
    else if (totalPaid > 0) status = "Partial";

    return {
      id: student.id,
      name: student.name,
      admissionNo: student.admissionNo,
      fatherName: student.fatherName,
      phone: student.phone,

      className: enrollment
        ? `${enrollment.class.Grade.level}-${enrollment.class.section}`
        : "-",

      totalFee,
      totalPaid,
      totalDiscount,
      totalFine,
      totalDue,
      status,
    };
  });
}