import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { studentschema } from "@/lib/formValidationSchemas";
import { AcademicYear } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------------
       1️⃣ Resolve Tenant
    ------------------------------------------------------- */

    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    console.log("Resolved schoolId:", schoolId);

    /* -------------------------------------------------------
       2️⃣ Authorize (Admin Only)
    ------------------------------------------------------- */
    const user = await fetchUserInfo(schoolSlug);
    console.log("User from fetchUserInfo:", user);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    /* -------------------------------------------------------
       3️⃣ Validate Input
    ------------------------------------------------------- */
    const body = await req.json();
    const parsed = studentschema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      id,
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
       4️⃣ Admission Number Required
    ------------------------------------------------------- */
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { message: "Admission number is required." },
        { status: 400 },
      );
    }

    const admissionNo = id.trim();
    const username = `s${admissionNo}`;
    const phoneNumber = `+91${phone}`;
    const password = phone;

    /* -------------------------------------------------------
       5️⃣ Validate Academic Year
    ------------------------------------------------------- */
    const normalizedYear = academicYear
      ?.trim()
      .toUpperCase() as keyof typeof AcademicYear;

    if (!AcademicYear[normalizedYear]) {
      return NextResponse.json(
        { message: `Invalid academic year: ${academicYear}` },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------
       6️⃣ Prevent Duplicate Admission Number (Tenant Safe)
    ------------------------------------------------------- */
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: admissionNo,
        schoolId,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: `Admission number "${admissionNo}" already exists.` },
        { status: 409 },
      );
    }

    /* -------------------------------------------------------
       7️⃣ Prevent Duplicate Username (Tenant Safe)
    ------------------------------------------------------- */
    const existingLinked = await prisma.linkedUser.findUnique({
      where: {
        username_schoolId: {
          username,
          schoolId,
        },
      },
    });

    if (existingLinked) {
      return NextResponse.json(
        { message: `Username "${username}" already exists.` },
        { status: 409 },
      );
    }

    /* -------------------------------------------------------
       8️⃣ Validate Class (Tenant Safe)
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
        { status: 400 },
      );
    }

    /* -------------------------------------------------------
       9️⃣ Create / Get Clerk Parent User
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
       🔟 Profile (Global)
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
       1️⃣1️⃣ Atomic Transaction
    ------------------------------------------------------- */
    const student = await prisma.$transaction(async (tx) => {
      // LinkedUser
      const linkedUser = await tx.linkedUser.create({
        data: {
          username,
          role: "student",
          profileId: profile.id,
          schoolId,
        },
      });

      // Activate Role
      await tx.profile.update({
        where: { id: profile.id },
        data: { activeUserId: linkedUser.id },
      });

      if (!dob) {
        throw new Error("Date of birth is required");
      }

      // Student Create
      const newStudent = await tx.student.create({
        data: {
          id: admissionNo,
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
          dob: new Date(dob),
        },
      });

      // Assign Fee Structures
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
            schoolId,
          })),
        });
      }

      return newStudent;
    });

    /* -------------------------------------------------------
       ✅ Success
    ------------------------------------------------------- */
    return NextResponse.json(
      {
        message: "Student created successfully",
        student,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Student creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate record detected." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
