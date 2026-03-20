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

  const data = await prisma.feeTransaction.groupBy({
    by: ["paymentMode"],
    where: {
      schoolId: access.schoolId,
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  return NextResponse.json({ data });
}