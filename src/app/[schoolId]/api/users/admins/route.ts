import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const body = await req.json();
    const data = adminSchema.parse(body);

    const client = await clerkClient();

    /* ---------------------------------------
       1️⃣  Clerk User (Global Identity)
    --------------------------------------- */

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

    await client.users.updateUser(clerkUser.id, {
      publicMetadata: { role: "admin" },
    });

    /* ---------------------------------------
       2️⃣  Find or Create Profile (GLOBAL)
    --------------------------------------- */

    let profile = await prisma.profile.findFirst({
      where: { phone: data.phone },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          phone: data.phone,
          clerk_id: clerkUser.id,
        },
      });
    }

    /* ---------------------------------------
       3️⃣  Create LinkedUser (School Scoped Role)
    --------------------------------------- */

    const existingRole = await prisma.linkedUser.findFirst({
      where: {
        username: data.username,
        schoolId,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: "Username already exists in this school" },
        { status: 409 }
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

    /* ---------------------------------------
       4️⃣  Create Admin (School Scoped Entity)
    --------------------------------------- */

    const admin = await prisma.admin.create({
      data: {
        username: data.username,
        password: data.password,
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

    /* ---------------------------------------
       5️⃣  Set Active Role
    --------------------------------------- */

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        activeUserId: linkedUser.id,
      },
    });

    return NextResponse.json(
      { success: true, admin },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Admin creation error:", error);

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
