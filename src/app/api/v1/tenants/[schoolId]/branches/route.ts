export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";

/* ================= IMPORTS ================= */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId: slug } = await params;

  const { access, error } = await tenantSlugGuard(slug);
  if (error) return error;

  try {
    const body = await req.json();

    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        type: body.type, // ensure enum matches
        order: body.order ?? 0,
        schoolId: access.schoolId,
      },
    });

    return NextResponse.json(branch);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Branch with this name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}

/* ================= GET BRANCHES ================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId: slug } = await params;

  const { access, error } = await tenantSlugGuard(slug);
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";

  const where: any = {
    schoolId: access.schoolId,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const branches = await prisma.branch.findMany({
    where,
    orderBy: [
      { order: "asc" }, // 🔥 important for UI ordering
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      type: true,
      order: true,
    },
  });

  return NextResponse.json({
    data: branches,
  });
}