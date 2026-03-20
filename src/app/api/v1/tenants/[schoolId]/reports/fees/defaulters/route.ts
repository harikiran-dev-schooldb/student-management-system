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

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId");

  const skip = (page - 1) * limit;

  /* ---------------- WHERE ---------------- */
  const where: any = {
    schoolId: access.schoolId,
    dueAmount: { gt: 0 },
  };

  if (search) {
    where.student = {
      name: {
        contains: search,
        mode: "insensitive",
      },
    };
  }

  if (classId) {
    where.student = {
      ...(where.student || {}),
      enrollments: {
        some: {
          classId: Number(classId),
        },
      },
    };
  }

  /* ---------------- QUERY ---------------- */
  const [data, total] = await Promise.all([
    prisma.studentTotalFees.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { dueAmount: "desc" },
      skip,
      take: limit,
    }),

    prisma.studentTotalFees.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}