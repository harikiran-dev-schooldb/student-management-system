import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Helper: Parse DOB in dd-mm-yyyy format
function parseDDMMYYYY(dob: string): Date | null {
  const [dd, mm, yyyy] = dob.split("-");
  if (!dd || !mm || !yyyy) return null;
  const iso = `${yyyy}-${mm}-${dd}`;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date;
}

export async function POST(req: NextRequest) {
  try {
    const { students } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    let feesMapped = 0;
    const clerkCreated = 0;
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

      if (!id || !rawUsername || !name || !dob || !classId || !phone) {
        errors.push(
          `Missing required fields for student: ${rawUsername || id}`
        );
        continue;
      }

      const parsedDob = parseDDMMYYYY(dob);
      if (!parsedDob) {
        errors.push(`Invalid DOB format for student: ${id} (${dob})`);
        continue;
      }

      const cls = await prisma.class.findUnique({
        where: { id: Number(classId) },
        include: { Grade: true },
      });

      if (!cls || !cls.Grade) {
        errors.push(`Invalid classId or missing grade for student ID: ${id}`);
        continue;
      }

      // ✅ Step 1: Ensure Profile exists for this phone
      let profile = await prisma.profile.findFirst({
        where: { phone },
        include: { users: true },
      });

      if (!profile) {
        const normalizedClerkId =
          providedClerkId && providedClerkId.trim() !== ""
            ? providedClerkId
            : null;

        profile = await prisma.profile.create({
          data: {
            phone,
            clerk_id: normalizedClerkId,
          },
          include: { users: true },
        });
        console.log(
          `Created profile for phone: ${phone} (Profile ID: ${profile.id})`
        );
      }

      // ✅ Step 2: Ensure Student Role exists for this profile
      const studentUsername = `s${id}`;
      let role = profile.users.find((r) => r.role === "student");

      if (!role) {
        role = await prisma.linkedUser.create({
          data: {
            role: "student",
            username: studentUsername,
            profileId: profile.id,
          },
        });
      }

      // ✅ Step 3: Upsert Student entity linked to Profile
      let student = await prisma.student.findUnique({ where: { id } });

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
          },
        });
        created++;
      }

      console.log(`Processed student: ${id} - ${name} (${student.id})`);

      // ✅ Step 4: Fee structure mapping (strict academic year match)
      const feeStructures = await prisma.feeStructure.findMany({
        where: {
          gradeId: cls.Grade.id,
          academicYear: academicYear as any,
        },
      });

      if (!feeStructures.length) {
        errors.push(
          `No fee structure for student ${id} (grade: ${cls.Grade.id}, year: ${academicYear})`
        );
        continue;
      }

      // 🧹 First, cleanup any mismatched fee records (wrong year)
      await prisma.studentFees.deleteMany({
        where: {
          studentId: id,
          NOT: { academicYear: academicYear as any },
        },
      });

      // 🛡️ Then only insert fees for the correct year if not already existing
      for (const fee of feeStructures) {
        await prisma.studentFees.upsert({
          where: {
            studentId_academicYear_term: {
              studentId: id,
              academicYear: fee.academicYear,
              term: fee.term,
            },
          },
          update: {}, // do nothing if exists
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
          },
        });
      }

      feesMapped++;
    }

    return NextResponse.json({
      message: `✅ Upload complete: Created: ${created}, Updated: ${updated}, Fees Mapped: ${feesMapped}, Clerk Created: ${clerkCreated}`,
      errors,
    });
  } catch (error) {
    console.error("💥 Bulk upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
