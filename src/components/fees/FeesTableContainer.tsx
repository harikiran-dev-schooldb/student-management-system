import React from "react";
import prisma from "@/lib/prisma";
import FeesTable from "./FeesTable";
import { FeeType, StudentFee } from "../../../types";

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
  1. Student + Enrollment
  --------------------------------------------------*/
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          class: {
            include: { Grade: true },
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
    return (
      <div className="text-sm text-gray-500">
        No active enrollment found
      </div>
    );
  }

  const gradeId = enrollment.class.gradeId;

  /* -------------------------------------------------
  2. Student Fees (SOURCE OF TRUTH)
  --------------------------------------------------*/
  const studentFees = await prisma.studentFees.findMany({
    where: { studentId },
    include: {
      feeStructure: true,
      feeCycle: true,
      feeTransactions: true,
      academicYear: true,
    },
  });

  if (studentFees.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No fees assigned to this student.
      </div>
    );
  }

  /* -------------------------------------------------
  3. Transform (NO term, ONLY feeCycle)
  --------------------------------------------------*/
  const transformedData: StudentFee[] = studentFees.map((sf) => ({
    id: sf.id,
    studentId: sf.studentId,

    feeCycleId: sf.feeCycleId ?? 0,

    academicYearId: sf.academicYearId,
    academicYear: sf.academicYear
      ? {
          id: sf.academicYear.id,
          name: sf.academicYear.name,
        }
      : undefined,

    paidAmount: sf.paidAmount ?? 0,
    discountAmount: sf.discountAmount ?? 0,
    fineAmount: sf.fineAmount ?? 0,
    dueAmount: sf.dueAmount ?? 0, // ✅ IMPORTANT

    receiptDate: sf.receiptDate?.toISOString(),
    receiptNo: sf.receiptNo ?? undefined,
    remarks: sf.remarks ?? undefined,
    paymentMode: sf.paymentMode ?? "CASH",

    /* ✅ feeCycle */
    feeCycle: sf.feeCycle
      ? {
          id: sf.feeCycle.id,
          name: sf.feeCycle.name,
        }
      : undefined,

    /* ✅ feeStructure (new shape) */
    feeStructure: sf.feeStructure
  ? {
      id: sf.feeStructure.id,
      amount: sf.feeStructure.amount ?? 0,
      feeType:
        (sf.feeStructure.feeType as FeeType) ?? "OTHER", // ✅ FIX
    }
  : undefined,

    /* ✅ Transactions */
    feeTransactions:
      sf.feeTransactions?.map((tx) => ({
        receiptNo: tx.receiptNo ?? undefined,
        remarks: tx.remarks ?? undefined,
      })) ?? [],
  }));

  /* -------------------------------------------------
  4. Render
  --------------------------------------------------*/
  return (
    <div className="w-full">
      <FeesTable
        data={transformedData}
        mode={mode}
        role={role}
        studentName={studentName}
        studentEmail={studentEmail}
        studentMobile={studentMobile}
      />
    </div>
  );
};

export default FeesTableContainer;