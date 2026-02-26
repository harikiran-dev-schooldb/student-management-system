export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

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
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;
    let feesMapped = 0;
    const errors: string[] = [];

    /* -------------------------------------------------
       🔥 PRELOAD CLASSES (ONE QUERY)
    -------------------------------------------------- */
    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: { Grade: true },
    });

    const classMap = new Map(classes.map((c) => [c.id, c]));

    /* -------------------------------------------------
       🔥 PRELOAD FEE STRUCTURES (ONE QUERY)
    -------------------------------------------------- */
    const feeStructures = await prisma.feeStructure.findMany({
      where: { schoolId },
    });

    const feeMap = new Map<string, typeof feeStructures>();

    for (const fee of feeStructures) {
      const key = `${fee.gradeId}-${fee.academicYear}`;
      if (!feeMap.has(key)) feeMap.set(key, []);
      feeMap.get(key)!.push(fee);
    }

    /* -------------------------------------------------
       🚀 PROCESS STUDENTS (TRANSACTION PER STUDENT)
    -------------------------------------------------- */
    for (const s of students) {
      try {
        const { id, name, phone, address, gender, dob, classId, academicYear } =
          s;

        if (!id || !name || !phone || !dob || !classId) {
          errors.push(`Missing required fields for ${id}`);
          continue;
        }

        const parsedDob = parseDDMMYYYY(dob);
        if (!parsedDob) {
          errors.push(`Invalid DOB for ${id}`);
          continue;
        }

        const cls = classMap.get(Number(classId));
        if (!cls) {
          errors.push(`Invalid class for ${id}`);
          continue;
        }

        await prisma.$transaction(async (tx) => {
          /* ---------------- UPSERT STUDENT ---------------- */
          const student = await tx.student.upsert({
            where: { id }, // ensure id is globally unique or use composite
            update: {
              name,
              phone,
              address,
              gender,
              dob: parsedDob,
              classId: Number(classId),
              academicYear,
            },
            create: {
              id,
              username: `s${id}`,
              name,
              phone,
              address,
              gender,
              dob: parsedDob,
              classId: Number(classId),
              academicYear,
              schoolId,
            },
          });

          /* ---------------- FEE MAPPING ---------------- */
          const feeKey = `${cls.Grade.id}-${academicYear}`;
          const fees = feeMap.get(feeKey);

          if (!fees) {
            errors.push(`No fee structure for ${id}`);
            return;
          }

          for (const fee of fees) {
            await tx.studentFees.upsert({
              where: {
                studentId_academicYear_term: {
                  studentId: id,
                  academicYear: fee.academicYear,
                  term: fee.term,
                  schoolId,
                },
              },
              update: {},
              create: {
                studentId: id,
                feeStructureId: fee.id,
                academicYear: fee.academicYear,
                term: fee.term,
                paidAmount: 0,
                discountAmount: 0,
                fineAmount: 0,
                abacusPaidAmount: 0,
                paymentMode: "CASH",
                schoolId,
              },
            });
          }

          feesMapped++;
        });
      } catch (err: any) {
        errors.push(`Student ${s.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message: "Upload complete",
      created,
      updated,
      feesMapped,
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
