import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { studentschema } from "@/lib/formValidationSchemas";
import { AcademicYear } from "@prisma/client";

/* -------------------------------------------------------
   Helper: Generate Next Numeric Student ID
------------------------------------------------------- */
async function generateStudentId(schoolId: string) {
  const last = await prisma.student.findFirst({
    where: { schoolId },
    orderBy: { id: "desc" },
    select: { id: true },
  });

  return last?.id
    ? (parseInt(last.id.toString()) + 1).toString()
    : "10000";
}

/* -------------------------------------------------------
   API
------------------------------------------------------- */
export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const body = await req.json();

    /* -------------------------------------------------------
       1️⃣ Validate Input
    ------------------------------------------------------- */
    const parsed = studentschema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      id: requestedId,
      name,
      phone,
      classId,
      academicYear,
      dob,
      email,
      gender,
      fatherName,
      motherName,
      penNo,
      motherAadhar,
      fatherAadhar,
      studentAadhar,
      bloodType,
      address,
      img,
    } = parsed.data;

    /* -------------------------------------------------------
       2️⃣ Normalize Academic Year
    ------------------------------------------------------- */
    const normalizedYear =
      academicYear?.trim().toUpperCase() as keyof typeof AcademicYear;

    if (!AcademicYear[normalizedYear]) {
      return NextResponse.json(
        { message: `Invalid academic year: ${normalizedYear}` },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       3️⃣ Generate ID + Username
    ------------------------------------------------------- */
    const id = requestedId || (await generateStudentId(schoolId));
    const username = `s${id}`;
    const phoneNumber = `+91${phone}`;
    const password = phone;

    /* -------------------------------------------------------
       4️⃣ Prevent Duplicate Username (Tenant Safe)
    ------------------------------------------------------- */
    const duplicate = await prisma.student.findUnique({
      where: {
        username_schoolId: {
          username,
          schoolId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: `Student username "${username}" already exists.` },
        { status: 409 }
      );
    }

    /* -------------------------------------------------------
       5️⃣ Validate Class (Tenant Safe)
    ------------------------------------------------------- */
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId,
      },
      select: { gradeId: true },
    });

    if (!classData) {
      return NextResponse.json(
        { message: "Invalid class for this school." },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       6️⃣ Clerk User (Parent Account)
    ------------------------------------------------------- */
    const client = await clerkClient();

    const existingClerk = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    const parentUser =
      existingClerk.data[0] ??
      (await client.users.createUser({
        username,
        password,
        firstName: name,
        phoneNumber: [phoneNumber],
        publicMetadata: { role: "student" },
      }));

    /* -------------------------------------------------------
       7️⃣ Profile (Global, NOT Tenant Scoped)
    ------------------------------------------------------- */
    const profile = await prisma.profile.upsert({
      where: { clerk_id: parentUser.id },
      update: {},
      create: {
        clerk_id: parentUser.id,
        phone,
      },
    });

    /* -------------------------------------------------------
       8️⃣ Transaction (Student + LinkedUser + Fees)
    ------------------------------------------------------- */
    const student = await prisma.$transaction(async (tx) => {
      /* 8.1 LinkedUser (Tenant Scoped) */
      const linkedUser = await tx.linkedUser.create({
        data: {
          username,
          role: "student",
          profileId: profile.id,
          schoolId, // 🔒 tenant safe
        },
      });

      await tx.profile.update({
        where: { id: profile.id },
        data: { activeUserId: linkedUser.id },
      });

      if (!dob) {
  throw new Error("Date of birth is required");
}

const newStudent = await tx.student.create({
  data: {
    id,
    username,
    name,
    fatherName,
    motherName,
    email: email ?? null,
    phone,
    penNo: penNo ?? null,
    motherAadhar: motherAadhar ?? null,
    fatherAadhar: fatherAadhar ?? null,
    studentAadhar: studentAadhar ?? null,
    address,
    gender,
    img: img ?? null,
    bloodType: bloodType ?? null,
    classId,
    academicYear: normalizedYear as AcademicYear,
    clerk_id: parentUser.id,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
    schoolId,
    dob: new Date(dob), // ✅ ALWAYS PROVIDED
  },
});


      /* 8.3 Assign Fee Structures (Tenant Safe) */
      const feeStructures = await tx.feeStructure.findMany({
        where: {
          gradeId: classData.gradeId,
          academicYear: normalizedYear as AcademicYear,
          schoolId,
        },
      });

      if (feeStructures.length > 0) {
        await tx.studentFees.createMany({
          data: feeStructures.map((f) => ({
            studentId: newStudent.id,
            feeStructureId: f.id,
            academicYear: f.academicYear,
            term: f.term,
            paidAmount: 0,
            discountAmount: 0,
            fineAmount: 0,
            abacusPaidAmount: 0,
            paymentMode: "CASH",
            schoolId, // 🔒 tenant safe
          })),
        });
      }

      return newStudent;
    });

    /* -------------------------------------------------------
       Success
    ------------------------------------------------------- */
    return NextResponse.json(
      {
        message: "✅ Student created successfully",
        student,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Student creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate record detected." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
