import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const accounts = await prisma.paymentAccount.findMany({
  where: { schoolId },
  orderBy: [{ branchId: "asc" }, { gradeId: "asc" }],
});

    return NextResponse.json(accounts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const { gradeId, branchId, accountId } = await req.json();

if (!gradeId || !branchId || !accountId) {
  return NextResponse.json(
    { error: "Missing fields" },
    { status: 400 }
  );
}

const data = await prisma.paymentAccount.upsert({
  where: {
    schoolId_branchId_gradeId: {
      schoolId,
      branchId,
      gradeId,
    },
  },
  update: {
    accountId,
  },
  create: {
    schoolId,
    branchId,
    gradeId,
    accountId,
  },
});

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

