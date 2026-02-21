import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   GET → Fetch Student Fees (Tenant + Role Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       2️⃣ Authenticate User
    ------------------------------ */
    const user = await fetchUserInfo(schoolId);

    if (!user || !user.profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       3️⃣ Authorization Check
    ------------------------------ */
    if (user.role === "student" && user.studentId !== studentId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* -----------------------------
       4️⃣ Fetch Student (Tenant Safe)
    ------------------------------ */
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId, // 🔒 Tenant isolation
      },
      include: {
        Class: {
          select: { gradeId: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const gradeId = student.Class?.gradeId;
    const academicYear = student.academicYear;

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade not found for student" },
        { status: 404 }
      );
    }

    /* -----------------------------
       5️⃣ Fetch Fee Structures
    ------------------------------ */
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId,
        gradeId,
        academicYear,
      },
    });

    /* -----------------------------
       6️⃣ Fetch Student Fees
    ------------------------------ */
    const studentFees = await prisma.studentFees.findMany({
      where: {
        schoolId,
        studentId,
        academicYear,
      },
    });

    /* -----------------------------
       7️⃣ Merge
    ------------------------------ */
    const feesWithPaymentStatus = feeStructures.map((fee) => {
      const matchingPayment = studentFees.find(
        (sf) => sf.feeStructureId === fee.id
      );

      return {
        feeStructureId: fee.id,
        studentId,
        term: fee.term,
        academicYear: fee.academicYear,
        paidAmount: matchingPayment?.paidAmount ?? 0,
        discountAmount: matchingPayment?.discountAmount ?? 0,
        fineAmount: matchingPayment?.fineAmount ?? 0,
        receivedDate: matchingPayment?.receivedDate ?? null,
        paymentMode: matchingPayment?.paymentMode ?? null,
      };
    });

    return NextResponse.json(feesWithPaymentStatus, { status: 200 });
  } catch (error) {
    console.error("Error fetching student fees:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}