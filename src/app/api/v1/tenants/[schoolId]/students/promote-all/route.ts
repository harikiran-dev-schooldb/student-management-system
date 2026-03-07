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

    /* 1️⃣ Resolve Tenant */

    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* 2️⃣ Authorization */

    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 3️⃣ Fetch Academic Years */

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!currentYear) {
      return NextResponse.json(
        { error: "Active academic year not found" },
        { status: 400 }
      );
    }

    const nextYear = await prisma.academicYear.findFirst({
      where: {
        schoolId,
        startDate: { gt: currentYear.startDate },
      },
      orderBy: { startDate: "asc" },
    });

    if (!nextYear) {
      return NextResponse.json(
        { error: "Next academic year not found" },
        { status: 400 }
      );
    }

    /* 4️⃣ Promotion Transaction */

    await prisma.$transaction(async (tx) => {

      const grades = await tx.grade.findMany({
        where: { schoolId },
        orderBy: { id: "asc" },
      });

      const enrollments = await tx.studentEnrollment.findMany({
        where: {
          schoolId,
          academicYearId: currentYear.id,
          status: "ACTIVE",
        },
        include: {
          class: true,
        },
      });

      for (const enrollment of enrollments) {

        const currentGrade = grades.find(
          g => g.id === enrollment.class.gradeId
        );

        const nextGrade = grades.find(
          g => g.id === currentGrade!.id + 1
        );

        /* Graduate last grade */

        if (!nextGrade) {

          await tx.studentEnrollment.update({
            where: { id: enrollment.id },
            data: { status: "PROMOTED" },
          });

          await tx.student.update({
            where: { id: enrollment.studentId },
            data: { status: "INACTIVE" },
          });

          continue;
        }

        /* Find target class */

        const targetClass = await tx.class.findFirst({
          where: {
            schoolId,
            gradeId: nextGrade.id,
            section: enrollment.class.section,
          },
        });

        if (!targetClass) continue;

        /* Mark current enrollment */

        await tx.studentEnrollment.update({
          where: { id: enrollment.id },
          data: { status: "PROMOTED" },
        });

        /* Create new enrollment */

        await tx.studentEnrollment.create({
          data: {
            studentId: enrollment.studentId,
            classId: targetClass.id,
            academicYearId: nextYear.id,
            status: "ACTIVE",
            schoolId,
          },
        });
      }

    });

    return NextResponse.json({
      success: true,
      message: "Students promoted successfully",
    });

  } catch (err) {

    console.error("Promotion error:", err);

    return NextResponse.json(
      { error: "Failed to promote students" },
      { status: 500 }
    );
  }
}