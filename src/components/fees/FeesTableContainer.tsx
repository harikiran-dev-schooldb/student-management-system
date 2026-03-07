import React from "react";
import prisma from "@/lib/prisma";
import FeesTable from "./FeesTable";
import { StudentFee } from "../../../types";

interface FeesTableContainerProps {
  studentId: string;
  mode: "collect" | "cancel" | "view";
  role?: "admin" | "student";
  studentName?: string;
  studentEmail?: string;
  studentMobile?: string;
}

const FeesTableContainer = async ({
  studentId,
  mode,
  role = "admin",
  studentName,
  studentEmail,
  studentMobile,
}: FeesTableContainerProps) => {

  /* -------------------------------------------------
  1. Fetch Student + Active Enrollment
  --------------------------------------------------*/
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          class: {
            include: {
              Grade: true,
            },
          },
          academicYear: true,
        },
        take: 1,
      },
    },
  });

  if (!student) {
    return <div className="text-sm text-gray-500">Student not found</div>;
  }

  const enrollment = student.enrollments[0];

  if (!enrollment) {
    return (<div className="text-sm text-gray-500">
      No active enrollment found </div>
    );
  }

  const gradeId = enrollment.class.gradeId;

  /* -------------------------------------------------
  2. Fetch Student Fees
  --------------------------------------------------*/
  const studentFees = await prisma.studentFees.findMany({
    where: { studentId },
    include: {
      feeTransactions: true,
      academicYear: true,
    },
  });

  if (studentFees.length === 0) {
    return (<div className="text-sm text-gray-500">
      No fees assigned to this student. </div>
    );
  }

  /* -------------------------------------------------
  3. Determine Assigned Academic Years
  --------------------------------------------------*/
  const assignedYearIds = [
    ...new Set(studentFees.map((sf) => sf.academicYearId)),
  ];

  /* -------------------------------------------------
  4. Fetch Fee Structures
  --------------------------------------------------*/
  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      gradeId,
      academicYearId: { in: assignedYearIds },
    },
    include: {
      academicYear: true,
    },
    orderBy: [
      { academicYear: { startDate: "asc" } },
      { term: "asc" },
    ],
  });

  /* -------------------------------------------------
  5. Merge Structures + Payments
  --------------------------------------------------*/
  const transformedData: StudentFee[] = feeStructures.map((fee) => {


    const payment = studentFees.find(
      (sf) => sf.feeStructureId === fee.id
    );

    return {
      id: payment?.id ?? 0,
      studentId,

      term: fee.term,

      academicYearId: fee.academicYearId,
      academicYear: {
        id: fee.academicYear.id,
        name: fee.academicYear.name,
      },

      paidAmount: payment?.paidAmount ?? 0,
      discountAmount: payment?.discountAmount ?? 0,
      fineAmount: payment?.fineAmount ?? 0,

      receiptDate: payment?.receiptDate?.toISOString(),
      receiptNo: payment?.receiptNo ?? undefined,
      remarks: payment?.remarks ?? undefined,
      paymentMode: payment?.paymentMode ?? "CASH",

      feeStructure: {
        id: fee.id,
        termFees: fee.termFees ?? 0,
        abacusFees: fee.abacusFees ?? 0,
        dueDate: fee.dueDate?.toISOString(),
      },

      feeTransactions:
        payment?.feeTransactions?.map((tx) => ({
          receiptNo: tx.receiptNo ?? undefined,
          remarks: tx.remarks ?? undefined,
        })) ?? [],
    };


  });

  /* -------------------------------------------------
  6. Render
  --------------------------------------------------*/
  return (<div className="w-full"> <FeesTable
    data={transformedData}
    mode={mode}
    role={role}
    studentName={studentName}
    studentEmail={studentEmail}
    studentMobile={studentMobile}
  /> </div>
  );
};

export default FeesTableContainer;
