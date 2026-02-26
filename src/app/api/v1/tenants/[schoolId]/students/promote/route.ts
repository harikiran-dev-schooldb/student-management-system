export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   POST → Promote Students (Admin Only, Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       2️⃣ Authenticate + Authorize
    ------------------------------ */
    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      studentIds,
      fromClassId,
      toClassId,
      academicYear,
    } = await req.json();

    if (
      !Array.isArray(studentIds) ||
      studentIds.length === 0 ||
      !fromClassId ||
      !toClassId ||
      !academicYear
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* -----------------------------
       3️⃣ Validate Classes Belong To School
    ------------------------------ */
    const [fromClass, toClass] = await Promise.all([
      prisma.class.findFirst({
        where: { id: Number(fromClassId), schoolId },
        select: { id: true },
      }),
      prisma.class.findFirst({
        where: { id: Number(toClassId), schoolId },
        select: { id: true },
      }),
    ]);

    if (!fromClass || !toClass) {
      return NextResponse.json(
        { error: "Invalid class selection" },
        { status: 400 }
      );
    }

    /* -----------------------------
       4️⃣ Validate Students Belong To School + From Class
    ------------------------------ */
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
        classId: Number(fromClassId),
      },
      select: { id: true },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Some students are invalid or not in selected class" },
        { status: 400 }
      );
    }

    /* -----------------------------
       5️⃣ Promote (Atomic Transaction)
    ------------------------------ */
    await prisma.$transaction(
      studentIds.map((studentId: string) =>
        prisma.student.update({
          where: { id: studentId },
          data: {
            classId: Number(toClassId),
            academicYear,
          },
        })
      )
    );

    return NextResponse.json(
      { success: true, message: "Promotion successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Promotion error:", error);

    return NextResponse.json(
      { error: "Promotion failed" },
      { status: 500 }
    );
  }
}