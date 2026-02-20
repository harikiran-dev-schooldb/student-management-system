import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

/* =======================================================
   PUT  /api/v1/tenants/{schoolId}/users/admins/{id}
======================================================= */

const client = await clerkClient();

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    /* ---------------- PARAMS ---------------- */
    const { id } = await context.params;

    /* ---------------- TENANT + RBAC ---------------- */
    const access = await requireTenantAccess();

    if (access.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    /* ---------------- BODY VALIDATION ---------------- */
    const body = await req.json();
    const data = adminSchema.parse(body);

    /* ---------------- ADMIN VALIDATION ---------------- */
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!existingAdmin || !existingAdmin.clerk_id) {
      return NextResponse.json(
        { error: "Admin not found in this tenant" },
        { status: 404 },
      );
    }

    /* ---------------- CLERK UPDATE ---------------- */

    const rawPhone = data.phone.replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("91")
      ? `+${rawPhone}`
      : `+91${rawPhone}`;

    const clerkUser = await client.users.getUser(existingAdmin.clerk_id);

    // Check if already attached
    const existingPhone = clerkUser.phoneNumbers.find(
      (p) => p.phoneNumber === formattedPhone,
    );

    if (!existingPhone) {
      try {
        const newPhone = await client.phoneNumbers.createPhoneNumber({
          userId: existingAdmin.clerk_id,
          phoneNumber: formattedPhone,
        });

        await client.phoneNumbers.updatePhoneNumber(newPhone.id, {
          verified: true,
        });

        await client.users.updateUser(existingAdmin.clerk_id, {
          primaryPhoneNumberID: newPhone.id,
        });
      } catch (err: any) {
        console.error("Phone creation error:", err?.errors || err);

        // If phone already exists elsewhere → return 409
        if (err.status === 422) {
          return NextResponse.json(
            { error: "Phone number already in use" },
            { status: 409 },
          );
        }

        throw err; // rethrow unexpected errors
      }
    }

    // ✅ Never send undefined or empty password to Clerk
    const clerkUpdatePayload: any = {
      firstName: data.name,
      username: data.username,
    };

    if (data.password && data.password.trim().length >= 5) {
      clerkUpdatePayload.password = data.password;
    }

    await client.users.updateUser(existingAdmin.clerk_id, clerkUpdatePayload);

    /* ---------------- DB UPDATE ---------------- */

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        username: data.username,
        name: data.name,
        parentName: data.parentName,
        gender: data.gender,
        email: data.email,
        address: data.address,
        bloodType: data.bloodType,
        dob: data.dob,
        img: data.img,
        phone: data.phone,
      },
    });

    return NextResponse.json({ success: true, updatedAdmin }, { status: 200 });
  } catch (error: any) {
    console.error("Admin update error:", error);

    return NextResponse.json(
      {
        error: error?.errors || error?.message || "Internal Server Error",
      },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}

/* =======================================================
   DELETE  /api/v1/tenants/{schoolId}/users/admins/{id}
======================================================= */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const access = await requireTenantAccess();

    if (access.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = access.schoolId;

    // 1️⃣ Fetch admin securely
    const admin = await prisma.admin.findUnique({
      where: {
        id,
        schoolId,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // 2️⃣ Prevent deleting yourself (optional but recommended)
    if (admin.clerk_id === access.userId) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 },
      );
    }

    // 3️⃣ Delete Clerk user first
    if (admin.clerk_id) {
      await client.users.deleteUser(admin.clerk_id);
    }

    // 4️⃣ Delete DB record (tenant-safe)
    await prisma.admin.deleteMany({
      where: {
        id,
        schoolId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete admin error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
