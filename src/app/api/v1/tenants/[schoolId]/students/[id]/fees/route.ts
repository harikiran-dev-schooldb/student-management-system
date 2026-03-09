export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ======================================================
   GET → Fetch Student Fees (Tenant + Role Safe)
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    /* 1️⃣ Resolve Tenant */
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* 2️⃣ Auth */
    const user = await fetchUserInfo(schoolSlug);

    if (!user || !user.profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 3️⃣ Student access restriction */
    if (user.role === "student" && user.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 4️⃣ Get active enrollment */
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        schoolId,
        status: "ACTIVE",
      },
      include: {
        class: {
          select: {
            gradeId: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student enrollment not found" },
        { status: 404 }
      );
    }

    const gradeId = enrollment.class.gradeId;
    const academicYearId = enrollment.academicYearId;

    /* 5️⃣ Fee structures for grade */
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId,
        gradeId,
        academicYearId,
      },
      orderBy: {
        term: "asc",
      },
    });

    /* 6️⃣ Student payments */
    const studentFees = await prisma.studentFees.findMany({
      where: {
        schoolId,
        studentId,
        academicYearId,
      },
    });

    /* 7️⃣ Merge fee + payment */
    const result = feeStructures.map((fee) => {
      const payment = studentFees.find(
        (sf) => sf.feeStructureId === fee.id
      );

      return {
        feeStructureId: fee.id,
        studentId,
        term: fee.term,
        academicYearId,
        assignedFee: (fee.termFees || 0) + (fee.abacusFees || 0),
        paidAmount: payment?.paidAmount ?? 0,
        discountAmount: payment?.discountAmount ?? 0,
        fineAmount: payment?.fineAmount ?? 0,
        receivedDate: payment?.receivedDate ?? null,
        paymentMode: payment?.paymentMode ?? null,
      };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Student fee API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch student fees" },
      { status: 500 }
    );
  }
}