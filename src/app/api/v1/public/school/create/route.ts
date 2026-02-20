import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

/* ======================================================
   POST → Create School + First Admin (SaaS Onboarding)
====================================================== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      schoolName,
      slug, // schoolId
      address,
      phone,
      email,
      website,

      adminUsername,
      adminPassword,
      adminName,
      adminParentName,
      adminPhone,
      adminAddress,
      adminEmail,
      adminGender,
    } = body;

    /* -------------------------------
       1️⃣ Basic Validation
    -------------------------------- */
    if (
      !schoolName ||
      !slug ||
      !address ||
      !adminUsername ||
      !adminPassword ||
      !adminName ||
      !adminParentName ||
      !adminPhone ||
      !adminAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* -------------------------------
       2️⃣ Slug Validation
    -------------------------------- */
    const slugRegex = /^[a-z0-9-]+$/;

    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug must contain only lowercase letters, numbers and hyphens",
        },
        { status: 400 }
      );
    }

    /* -------------------------------
       3️⃣ Check Slug Uniqueness
    -------------------------------- */
    const existingSchool = await prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: "School slug already taken" },
        { status: 409 }
      );
    }

    /* -------------------------------
       4️⃣ Hash Password
    -------------------------------- */
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    /* -------------------------------
       5️⃣ Transaction: Create School + Admin
    -------------------------------- */
    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.schoolInfo.create({
        data: {
          name: schoolName,
          schoolId: slug,
          address,
          phone,
          email,
          website,
        },
      });

      const admin = await tx.admin.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          name: adminName,
          parentName: adminParentName,
          gender: adminGender ?? "Male",
          phone: adminPhone,
          address: adminAddress,
          email: adminEmail,
          schoolId: school.id,
        },
      });

      return { school, admin };
    });

    return NextResponse.json(
      {
        success: true,
        message: "School created successfully",
        school: {
          id: result.school.id,
          name: result.school.name,
          slug: result.school.schoolId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("School creation error:", error);

    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}