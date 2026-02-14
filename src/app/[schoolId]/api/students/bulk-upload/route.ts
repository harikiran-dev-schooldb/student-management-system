import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

function parseDDMMYYYY(dob: string): Date | null {
  const [dd, mm, yyyy] = dob.split("-");
  if (!dd || !mm || !yyyy) return null;

  const iso = `${yyyy}-${mm}-${dd}`;
  const date = new Date(iso);

  return isNaN(date.getTime()) ? null : date;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId } = await context.params;
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

    const client = await clerkClient();

    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      const {
        id,
        username: rawUsername,
        name,
        fatherName,
        email,
        penNo,
        motherAadhar,
        fatherAadhar,
        studentAadhar,
        phone,
        address,
        img,
        bloodType,
        gender,
        dob,
        classId,
        clerk_id: providedClerkId,
        academicYear,
      } = s;

      /* -------------------------------------------------
         1️⃣ BASIC VALIDATION
      -------------------------------------------------- */
      if (!id || !rawUsername || !name || !dob || !classId || !phone) {
        errors.push(
          `Missing required fields for student: ${rawUsername || id}`,
        );
        continue;
      }

      const parsedDob = parseDDMMYYYY(dob);
      if (!parsedDob) {
        errors.push(`Invalid DOB format for student: ${id}`);
        continue;
      }

      /* -------------------------------------------------
         2️⃣ VALIDATE CLASS (Tenant Safe)
      -------------------------------------------------- */
      const cls = await prisma.class.findFirst({
        where: {
          id: Number(classId),
          schoolId,
        },
        include: { Grade: true },
      });

      if (!cls || !cls.Grade) {
        errors.push(`Invalid class for student ID: ${id}`);
        continue;
      }

      /* -------------------------------------------------
         3️⃣ PROFILE (BY PHONE)
      -------------------------------------------------- */
      let profile = await prisma.profile.findFirst({
        where: { phone },
        include: { users: true },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            phone,
            clerk_id: providedClerkId || null,
          },
          include: { users: true },
        });
      }

      /* -------------------------------------------------
   4️⃣ ENSURE LINKED USER ROLE (Tenant Safe)
-------------------------------------------------- */

      const studentUsername = `s${id}`;

      let role = await prisma.linkedUser.findFirst({
        where: {
          profileId: profile.id,
          role: "student",
          schoolId, // ✅ CRITICAL
        },
      });

      if (!role) {
        role = await prisma.linkedUser.create({
          data: {
            role: "student",
            username: studentUsername,
            profileId: profile.id,
            schoolId, // ✅ REQUIRED
          },
        });
      }

      /* -------------------------------------------------
         5️⃣ UPSERT STUDENT (Tenant Safe)
      -------------------------------------------------- */
      let student = await prisma.student.findFirst({
        where: {
          id,
          schoolId,
        },
      });

      if (student) {
        student = await prisma.student.update({
          where: { id },
          data: {
            username: studentUsername,
            name,
            fatherName,
            email,
            phone,
            penNo,
            motherAadhar,
            fatherAadhar,
            studentAadhar,
            address,
            img,
            bloodType,
            gender,
            dob: parsedDob,
            classId: Number(classId),
            clerk_id: providedClerkId || profile.clerk_id,
            academicYear,
            profileId: profile.id,
            schoolId, // ✅ REQUIRED
          },
        });
        updated++;
      } else {
        student = await prisma.student.create({
          data: {
            id,
            username: studentUsername,
            name,
            fatherName,
            email,
            phone,
            penNo,
            motherAadhar,
            fatherAadhar,
            studentAadhar,
            address,
            img,
            bloodType,
            gender,
            dob: parsedDob,
            classId: Number(classId),
            clerk_id: providedClerkId || profile.clerk_id,
            academicYear,
            profileId: profile.id,
            schoolId, // ✅ REQUIRED
          },
        });
        created++;
      }

      /* -------------------------------------------------
         6️⃣ FEE STRUCTURE MAPPING (Tenant Safe)
      -------------------------------------------------- */
      const feeStructures = await prisma.feeStructure.findMany({
        where: {
          gradeId: cls.Grade.id,
          academicYear,
          schoolId,
        },
      });

      if (!feeStructures.length) {
        errors.push(
          `No fee structure for student ${id} (grade ${cls.Grade.id}, year ${academicYear})`,
        );
        continue;
      }

      // Remove wrong-year records
      await prisma.studentFees.deleteMany({
        where: {
          studentId: id,
          schoolId,
          NOT: { academicYear },
        },
      });

      for (const fee of feeStructures) {
        await prisma.studentFees.upsert({
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
            schoolId, // ✅ REQUIRED
          },
        });
      }

      feesMapped++;
    }

    return NextResponse.json({
      message: `✅ Upload complete`,
      created,
      updated,
      feesMapped,
      errors,
    });
  } catch (error) {
    console.error("💥 Bulk upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
