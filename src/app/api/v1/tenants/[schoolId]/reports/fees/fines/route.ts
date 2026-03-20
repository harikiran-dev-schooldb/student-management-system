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

  const data = await prisma.feeTransaction.findMany({
    where: {
      schoolId: access.schoolId,
      fineAmount: { gt: 0 },
      deletedAt: null,
    },
  });

  return NextResponse.json({ data });
}