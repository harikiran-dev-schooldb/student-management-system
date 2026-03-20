export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId: slug } = await params;

  const { access, error } = await tenantSlugGuard(slug);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const transactions = await prisma.feeTransaction.findMany({
    where: {
      schoolId: access.schoolId,
      studentId,
      deletedAt: null,
    },
    orderBy: {
      receiptDate: "asc",
    },
  });

  let balance = 0;

  const ledger = transactions.map((tx) => {
    balance +=
      Number(tx.amount) +
      Number(tx.fineAmount) -
      Number(tx.discountAmount);

    return {
      ...tx,
      balance,
    };
  });

  return NextResponse.json({ data: ledger });
}