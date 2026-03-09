export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

function parseDDMMYYYY(dob: string): Date | null {
  const [dd, mm, yyyy] = dob.split("-");
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isNaN(date.getTime()) ? null : date;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { students } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    /* ---------- active academic year ---------- */

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    let created = 0;
    const errors: string[] = [];

    for (const s of students) {
      try {
        const {
          admissionNo,
          name,
          phone,
          address,
          gender,
          dob,
          classId,
          fatherName,
          motherName,
          email,
        } = s;

        if (!admissionNo || !name || !phone || !dob || !classId) {
          errors.push(`Missing required fields for ${admissionNo}`);
          continue;
        }

        const parsedDob = parseDDMMYYYY(dob);

        if (!parsedDob) {
          errors.push(`Invalid DOB for ${admissionNo}`);
          continue;
        }

        const username = `s${admissionNo}`;

        const classData = await prisma.class.findFirst({
          where: { id: Number(classId), schoolId },
          select: { gradeId: true },
        });

        if (!classData) {
          errors.push(`Invalid class for ${admissionNo}`);
          continue;
        }

        const identity = await createOrUpdateIdentity({
          username,
          phone,
          name,
          role: "student",
          schoolId,
        });

        await prisma.$transaction(async (tx) => {

          /* ---------- create student ---------- */

          const student = await tx.student.create({
            data: {
              admissionNo,
              username,
              name,
              phone,
              address,
              gender,
              dob: parsedDob,
              fatherName,
              motherName,
              email,
              clerk_id: identity.clerkId,
              profileId: identity.profileId,
              linkedUserId: identity.linkedUserId,
              schoolId,
            },
          });

          /* ---------- enrollment ---------- */

          await tx.studentEnrollment.create({
            data: {
              studentId: student.id,
              classId: Number(classId),
              academicYearId: academicYear.id,
              schoolId,
            },
          });

          /* ---------- fee structures ---------- */

          const feeStructures = await tx.feeStructure.findMany({
            where: {
              gradeId: classData.gradeId,
              academicYearId: academicYear.id,
              schoolId,
            },
          });

          if (feeStructures.length > 0) {
            await tx.studentFees.createMany({
              data: feeStructures.map((f) => ({
                studentId: student.id,
                feeStructureId: f.id,
                academicYearId: academicYear.id,
                term: f.term,
                paidAmount: 0,
                discountAmount: 0,
                fineAmount: 0,
                abacusPaidAmount: 0,
                paymentMode: "CASH",
                schoolId,
              })),
            });
          }

          /* ---------- total fees row ---------- */

          await tx.studentTotalFees.create({
            data: {
              studentId: student.id,
              academicYearId: academicYear.id,
              schoolId,
            },
          });

        });

        created++;

      } catch (err: any) {
        errors.push(`Student ${s.admissionNo}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message: "Upload complete",
      created,
      errors,
    });

  } catch (error) {
    console.error("Bulk upload failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}