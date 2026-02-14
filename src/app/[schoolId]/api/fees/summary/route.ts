import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const academicYear = searchParams.get("academicYear");

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  const where = {
    receiptDate: {
      gte: fromDate,
      lte: toDate,
    },
    academicYear: academicYear as any,
    transactionType: "PAYMENT",
    deletedAt: null,
  };

  /* -------------------------------
     1. Payment Mode Summary
  --------------------------------*/
  const paymentMode = await prisma.feeTransaction.groupBy({
    by: ["paymentMode"],
    where,
    _sum: {
      amount: true,
      discountAmount: true,
      fineAmount: true,
    },
    _count: { id: true },
  });

  /* -------------------------------
     2. Term-wise Summary
  --------------------------------*/
  const termWise = await prisma.feeTransaction.groupBy({
    by: ["term"],
    where,
    _sum: {
      amount: true,
      discountAmount: true,
      fineAmount: true,
    },
  });

  /* -------------------------------
     3. Class-wise Summary
  --------------------------------*/
  const classRaw = await prisma.feeTransaction.groupBy({
    by: ["studentId"],
    where,
    _sum: {
      amount: true,
      discountAmount: true,
      fineAmount: true,
    },
  });

  const students = await prisma.student.findMany({
    where: { id: { in: classRaw.map(r => r.studentId) } },
    select: { id: true, Class: { select: { name: true } } },
  });

  const classMap = new Map(
    students.map(s => [s.id, s.Class?.name ?? "Unknown"])
  );

  const classWise = Object.values(
    classRaw.reduce((acc, r) => {
      const cls = classMap.get(r.studentId) || "Unknown";
      acc[cls] ??= {
        className: cls,
        collected: 0,
        discount: 0,
        fine: 0,
      };

      acc[cls].collected += r._sum.amount ?? 0;
      acc[cls].discount += r._sum.discountAmount ?? 0;
      acc[cls].fine += r._sum.fineAmount ?? 0;

      return acc;
    }, {} as Record<string, any>)
  );

  return NextResponse.json({
    paymentMode,
    termWise,
    classWise,
  });
}
