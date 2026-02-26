export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

export async function POST(req: NextRequest) {
  try {
    /* =====================================================
       0️⃣  Tenant + Role Validation (VERY IMPORTANT)
    ===================================================== */

    const access = await requireTenantAccess();
    console.log("Access info:", access);

    // Only existing admins can create another admin
    if (access.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    console.log("School ID:", schoolId);

    const client = await clerkClient();

    const body = await req.json();
    const data = adminSchema.parse(body);

    /* =====================================================
       1️⃣  Clerk User (Global Identity)
    ===================================================== */

    const phoneNumber = `+91${data.phone}`;

    const existingClerkUsers = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    let clerkUser;

    if (existingClerkUsers.data.length > 0) {
      clerkUser = existingClerkUsers.data[0];
    } else {
      clerkUser = await client.users.createUser({
        firstName: data.name,
        username: data.username,
        password: data.password,
        phoneNumber: [phoneNumber],
      });
    }

    /* =====================================================
       2️⃣  Validate School Exists
    ===================================================== */

    /* =====================================================
       3️⃣  Find or Create Profile (GLOBAL)
    ===================================================== */

    let profile = await prisma.profile.findFirst({
      where: { clerk_id: clerkUser.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          phone: data.phone,
          clerk_id: clerkUser.id,
        },
      });
    }

    /* =====================================================
       4️⃣  Create LinkedUser (School Scoped Role)
    ===================================================== */

    const existingRole = await prisma.linkedUser.findFirst({
      where: {
        username: data.username,
        schoolId,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: "Username already exists in this school" },
        { status: 409 },
      );
    }

    const linkedUser = await prisma.linkedUser.create({
      data: {
        username: data.username,
        role: "admin",
        profileId: profile.id,
        schoolId,
      },
    });

    /* =====================================================
       5️⃣  Create Admin Entity
    ===================================================== */

    const admin = await prisma.admin.create({
      data: {
        username: data.username,
        password: data.password ,
        name: data.name,
        parentName: data.parentName,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        address: data.address,
        bloodType: data.bloodType,
        dob: data.dob,
        img: data.img ?? null,
        clerk_id: clerkUser.id,
        schoolId,
        profileId: profile.id,
        linkedUserId: linkedUser.id,
      },
    });

    /* =====================================================
       6️⃣  Set Active Role
    ===================================================== */

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        activeUserId: linkedUser.id,
      },
    });

    return NextResponse.json({ success: true, admin }, { status: 201 });
  } catch (error: any) {
    console.error("Admin creation error:", error);

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}
