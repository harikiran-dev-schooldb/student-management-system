export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string}> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */

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

    /* -----------------------------
       3️⃣ Promote Inside Transaction
    ------------------------------ */
    await prisma.$transaction(async (tx) => {

      const grades = await tx.grade.findMany({
        where: { schoolId },
        orderBy: { id: "asc" },
      });

      for (let i = 0; i < grades.length; i++) {

        const currentGrade = grades[i];
        const nextGrade = grades[i + 1];

        // Last grade → graduate students
        if (!nextGrade) {
          await tx.student.updateMany({
            where: {
              schoolId,
              status: "ACTIVE",
              Class: { gradeId: currentGrade.id },
            },
            data: {
              status: "INACTIVE",
            },
          });
          continue;
        }

        // Get mapping of sections
        const fromClasses = await tx.class.findMany({
          where: { schoolId, gradeId: currentGrade.id },
        });

        const toClasses = await tx.class.findMany({
          where: { schoolId, gradeId: nextGrade.id },
        });

        const toClassMap = new Map(
          toClasses.map(c => [c.section, c])
        );

        for (const fromClass of fromClasses) {

          const targetClass =
            toClassMap.get(fromClass.section) ||
            toClasses[0]; // fallback

          if (!targetClass) continue;

          await tx.student.updateMany({
            where: {
              schoolId,
              status: "ACTIVE",
              classId: fromClass.id,
            },
            data: {
              classId: targetClass.id,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "All students promoted successfully.",
    });

  } catch (err) {
    console.error("Promotion error:", err);
    return NextResponse.json(
      { error: "Failed to promote all students." },
      { status: 500 }
    );
  }
}