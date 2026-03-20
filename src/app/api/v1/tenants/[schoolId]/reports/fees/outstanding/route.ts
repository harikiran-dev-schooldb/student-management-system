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

  const data = await prisma.studentTotalFees.findMany({
    where: {
      schoolId: access.schoolId,
      dueAmount: { gt: 0 },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      dueAmount: "desc",
    },
  });

  return NextResponse.json({ data });
}