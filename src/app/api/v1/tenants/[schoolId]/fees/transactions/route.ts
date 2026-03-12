export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { PaymentMode } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { calculateDueAmount, getAssignedFee } from "@/lib/fees/fees";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { buildReceiptNumber } from "@/lib/fees/generateReceipt";
import { generateFeeRemark } from "@/lib/fees/generateRemark";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedByName = user.fullName ?? user.username ?? "Unknown";

    const body = await req.json();

    const {
      studentId,
      term,
      academicYearId,
      amount = 0,
      discountAmount = 0,
      fineAmount = 0,
      receiptDate,
      remarks,
      paymentMode = PaymentMode.CASH,
    } = body;

    if (!studentId || !term || !academicYearId) {
      return NextResponse.json(
        { message: "studentId, term, academicYearId required" },
        { status: 400 },
      );
    }

    const parsedReceiptDate =
      receiptDate && !isNaN(Date.parse(receiptDate))
        ? new Date(receiptDate)
        : new Date();


    const autoRemark = remarks || generateFeeRemark(term, parsedReceiptDate);

    const academicYear = await db.academicYear.findUnique({
      where: { id: academicYearId },
      select: { name: true },
    });

    if (!academicYear) {
      throw new Error("Academic year not found");
    }




    const result = await db.$transaction(async (tx) => {

      // 1️⃣ increment receipt sequence safely
      const seq = await tx.receiptSequence.upsert({
        where: {
          schoolId_academicYearId: {
            schoolId,
            academicYearId,
          },
        },
        update: {
          currentNo: { increment: 1 },
        },
        create: {
          schoolId,
          academicYearId,
          currentNo: 1,
        },
        select: {
          currentNo: true,
        },
      });

      const generatedReceiptNo = buildReceiptNumber(
        academicYear.name,
        seq.currentNo
      );

      /* ===============================
         Fetch StudentFees
      =============================== */

      const studentFee = await tx.studentFees.findUnique({
        where: {
          studentId_academicYear_term: {
            studentId,
            academicYearId,
            term,
            schoolId,
          },
        },
        include: {
          feeStructure: true,
        },
      });

      if (!studentFee) {
        throw new Error("Student fee record not found");
      }

      const currentDue = calculateDueAmount(studentFee);

      if (amount > currentDue) {
        throw new Error("Overpayment not allowed");
      }

      /* ===============================
         Update StudentFees
      =============================== */

      const updatedFee = await tx.studentFees.update({
        where: { id: studentFee.id },
        data: {
          paidAmount: { increment: amount },
          discountAmount: { increment: discountAmount },
          fineAmount: { increment: fineAmount },
          receiptDate: parsedReceiptDate,
          paymentMode,
          remarks: autoRemark,
        },
      });

      const assignedFee = getAssignedFee(studentFee);

      const newDue = calculateDueAmount({
        ...studentFee,
        paidAmount: studentFee.paidAmount + amount,
        discountAmount: studentFee.discountAmount + discountAmount,
        fineAmount: studentFee.fineAmount + fineAmount,
      });

      /* ===============================
         Update StudentTotalFees
      =============================== */

      const updatedTotal = await tx.studentTotalFees.upsert({
        where: {
          studentId_academicYearId_schoolId: {
            studentId,
            schoolId,
            academicYearId,
          },
        },
        update: {
          totalPaidAmount: { increment: amount },
          totalDiscountAmount: { increment: discountAmount },
          totalFineAmount: { increment: fineAmount },
          dueAmount: newDue,
        },
        create: {
          studentId,
          schoolId,
          academicYearId,
          totalPaidAmount: amount,
          totalDiscountAmount: discountAmount,
          totalFineAmount: fineAmount,
          totalAbacusAmount: 0,
          totalFeeAmount: assignedFee,
          dueAmount: newDue,
        },
      });

      /* ===============================
         Create FeeTransaction
      =============================== */

      const transaction = await tx.feeTransaction.create({
        data: {
          studentId,
          studentFeesId: studentFee.id,
          term,
          academicYearId,
          amount,
          discountAmount,
          fineAmount,
          receiptDate: parsedReceiptDate,
          receiptNo: generatedReceiptNo,
          paymentMode,
          remarks: autoRemark,
          updatedByName,
          schoolId,
        },
      });

      /* ===============================
         Fetch Student + Class
      =============================== */

      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          enrollments: {
            select: {
              class: {
                select: { id: true, name: true },
              },
            },
            take: 1,
          },
        },
      });

      const school = await tx.schoolInfo.findUnique({
        where: { id: schoolId },
        select: { name: true },
      });

      if (student && school) {
        await tx.messages.create({
          data: {
            type: "FEE_COLLECTION",
            message: getMessageContent("FEE_COLLECTION", {
              studentName: student.name,
              className: student.enrollments?.[0]?.class?.name ?? null,
              schoolName: school.name,
              amount,
              term,
              date: parsedReceiptDate,
            }),
            studentId,
            classId: student.enrollments?.[0]?.class?.id,
            schoolId,
            date: parsedReceiptDate,
          },
        });
      }

      return { updatedFee, updatedTotal, transaction };
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully",
        ...result,
      },
      { status: 200 },
    );

  } catch (error: any) {
    console.error("Fee transaction error:", error);

    return NextResponse.json(
      { message: error.message || "Payment failed" },
      { status: 400 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    const db = tenantPrisma(schoolId);

    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {
      schoolId,
    };

    if (from || to) {
      where.receiptDate = {};

      if (from) {
        where.receiptDate.gte = new Date(from);
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.receiptDate.lte = end;
      }
    }

    const transactions = await db.feeTransaction.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollments: {
              select: {
                class: {
                  select: { name: true },
                },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        receiptDate: "desc",
      },
    });

    const formatted = transactions.map((t) => ({
      ...t,
      student: t.student
        ? {
            id: t.student.id,
            name: t.student.name,
            Class: {
              name:
                t.student.enrollments?.[0]?.class?.name ?? null,
            },
          }
        : null,
    }));

    return NextResponse.json({
      data: formatted,
    });

  } catch (error: any) {
    console.error("Fetch transactions error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}