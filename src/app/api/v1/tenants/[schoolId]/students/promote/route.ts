export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      studentIds,
      fromClassId,
      toClassId,
      fromAcademicYearId, // ✅ NEW
      toAcademicYearId,   // ✅ NEW
    } = await req.json();

    if (
      !Array.isArray(studentIds) ||
      studentIds.length === 0 ||
      !fromClassId ||
      !toClassId ||
      !fromAcademicYearId ||
      !toAcademicYearId
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* Validate classes */

    const [fromClass, toClass] = await Promise.all([
      prisma.class.findFirst({
        where: { id: Number(fromClassId), schoolId },
      }),
      prisma.class.findFirst({
        where: { id: Number(toClassId), schoolId },
      }),
    ]);

    if (!fromClass || !toClass) {
      return NextResponse.json(
        { error: "Invalid class selection" },
        { status: 400 }
      );
    }

    /* Validate CURRENT enrollments */

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId: { in: studentIds },
        classId: Number(fromClassId),
        academicYearId: Number(fromAcademicYearId), // ✅ FIX
        schoolId,
        status: "ACTIVE",
      },
    });

    if (enrollments.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Some students not found in current class/year" },
        { status: 400 }
      );
    }

    /* Promotion */

    await prisma.$transaction(async (tx) => {
      for (const enrollment of enrollments) {

        // mark old
        await tx.studentEnrollment.update({
          where: { id: enrollment.id },
          data: { status: "PROMOTED" },
        });

        // create new (NEXT YEAR)
        await tx.studentEnrollment.create({
          data: {
            studentId: enrollment.studentId,
            classId: Number(toClassId),
            academicYearId: Number(toAcademicYearId), // ✅ FIX
            schoolId,
            status: "ACTIVE",
            promotedFromId: enrollment.id,
          },
        });
      }
    });

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