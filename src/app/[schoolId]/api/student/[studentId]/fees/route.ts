import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  try {
    // ✅ Step 1: Get Student → including Class & Grade
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        Class: {
          include: {
            Grade: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const gradeId = student.Class?.gradeId;
    const academicYear = student.academicYear; // ✅ student's current year

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade not found for student" },
        { status: 404 }
      );
    }

    console.log(`🏫 Grade ID: ${gradeId}, 📘 Academic Year: ${academicYear}`);

    // ✅ Step 2: Get Fee Structures only for this year
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        gradeId: gradeId,
        academicYear: academicYear,
      },
    });

    // ✅ Step 3: Get Student's Fees only for this year
    const studentFees = await prisma.studentFees.findMany({
      where: {
        studentId,
        academicYear: academicYear,
      },
    });

    console.log(
      `💰 Found ${feeStructures.length} fee structures and ${studentFees.length} student fees records.`
    );

    // ✅ Step 4: Merge data
    const feesWithPaymentStatus = feeStructures.map((fee) => {
      const matchingPayment = studentFees.find(
        (sf) => sf.feeStructureId === fee.id
      );

      return {
        feeStructureId: fee.id,
        studentId,
        term: fee.term,
        academicYear: fee.academicYear,
        paidAmount: matchingPayment?.paidAmount || 0,
        discountAmount: matchingPayment?.discountAmount || 0,
        fineAmount: matchingPayment?.fineAmount || 0,
        receivedDate: matchingPayment?.receivedDate || null,
        paymentMode: matchingPayment?.paymentMode || null,
      };
    });

    return NextResponse.json(feesWithPaymentStatus, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching student fees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
