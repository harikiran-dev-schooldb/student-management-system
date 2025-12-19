import React from "react";
import prisma from "@/lib/prisma";
import FeesTable from "./FeesTable";
import { StudentFee } from "../../../types";
import { AcademicYear } from "@prisma/client";

interface FeesTableContainerProps {
  studentId: string;
  mode: "collect" | "cancel";
}

const FeesTableContainer = async ({
  studentId,
  mode,
}: FeesTableContainerProps) => {
  /* -------------------------------------------------
     1. Fetch Student
  --------------------------------------------------*/
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { Class: { include: { Grade: true } } },
  });

  if (!student) return <div>Student not found</div>;

  const gradeId = student.Class?.gradeId;
  if (!gradeId) return <div>Grade not found for student</div>;

  /* -------------------------------------------------
     2. Fetch Student Fees (SOURCE OF TRUTH)
  --------------------------------------------------*/
  const studentFees = await prisma.studentFees.findMany({
    where: { studentId },
    include: { feeTransactions: true },
  });

  if (studentFees.length === 0) {
    return (
      <div className="w-full">
        <h1 className="text-lg font-semibold mb-4">
          {mode === "collect" ? "Collect Fees" : "Cancel Fees"}
        </h1>
        <p className="text-sm text-gray-500">
          No fees have been assigned to this student yet.
        </p>
      </div>
    );
  }

  /* -------------------------------------------------
     3. Determine Assigned Academic Years
  --------------------------------------------------*/
  const assignedYears: AcademicYear[] = [
    ...new Set(studentFees.map((sf) => sf.academicYear)),
  ];

  /* -------------------------------------------------
     4. Fetch Fee Structures ONLY for assigned years
  --------------------------------------------------*/
  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      gradeId,
      academicYear: { in: assignedYears },
    },
    orderBy: [{ academicYear: "asc" }, { term: "asc" }],
  });

  /* -------------------------------------------------
     5. Merge (NORMALIZE null → undefined)
  --------------------------------------------------*/
  const transformedData: StudentFee[] = feeStructures.map((fee) => {
    const matchingPayment = studentFees.find(
      (sf) => sf.feeStructureId === fee.id
    );

    return {
      id: matchingPayment?.id ?? 0,
      studentId,
      academicYear: fee.academicYear,
      feeStructureId: fee.id,
      term: fee.term,

      paidAmount: matchingPayment?.paidAmount ?? 0,
      discountAmount: matchingPayment?.discountAmount ?? 0,
      fineAmount: matchingPayment?.fineAmount ?? 0,
      abacusPaidAmount: matchingPayment?.abacusPaidAmount ?? null,

      // ⬇️ Normalize Prisma nulls
      receiptDate: matchingPayment?.receiptDate?.toISOString() ?? undefined,
      receiptNo: matchingPayment?.receiptNo ?? undefined,
      remarks: matchingPayment?.remarks ?? undefined,
      paymentMode: matchingPayment?.paymentMode ?? "CASH",

      feeStructure: {
        id: fee.id,
        termFees: fee.termFees ?? 0,
        abacusFees: fee.abacusFees ?? 0,
        dueDate: fee.dueDate?.toISOString() ?? undefined,
      },

      feeTransactions:
        matchingPayment?.feeTransactions?.map((tx) => ({
          receiptNo: tx.receiptNo ?? undefined,
          remarks: tx.remarks ?? undefined,
        })) ?? [],
    };
  });

  /* -------------------------------------------------
     6. Render
  --------------------------------------------------*/
  return (
    <div className="w-full">
      <h1 className="text-lg font-semibold mb-4">
        {mode === "collect" ? "Collect Fees" : "Cancel Fees"}
      </h1>

      <FeesTable data={transformedData} mode={mode} />
    </div>
  );
};

export default FeesTableContainer;
