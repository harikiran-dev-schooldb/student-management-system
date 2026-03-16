import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";
import { tenantGuard } from "@/lib/tenantGuard";

export async function POST(req: NextRequest
) {
  try {
 
    const body = await req.json();
    const data = adminSchema.parse(body);
 
    /* 1️⃣ Tenant Access */
    const { access, error } = await tenantGuard();
    if (error) return error;

    if (access.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const schoolId = access.schoolId;

    /* 2️⃣ Validate Input */

    

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        username: data.username,
        schoolId,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this username already exists" },
        { status: 409 }
      );
    }

    /* 3️⃣ Create Identity */

    const identity = await createOrUpdateIdentity({
      username: data.username,
      phone: data.phone,
      name: data.name,
      role: "admin",
      schoolId,
    });

    /* 4️⃣ Create Admin Entity */

    const admin = await prisma.admin.create({
      data: {
        username: data.username,
        name: data.name,
        parentName: data.parentName,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        address: data.address,
        bloodType: data.bloodType,
        dob: data.dob,
        img: data.img ?? null,
        clerk_id: identity.clerkId,
        schoolId,
        profileId: identity.profileId,
        linkedUserId: identity.linkedUserId,
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
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}