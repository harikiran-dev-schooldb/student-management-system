export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";
import { tenantGuard } from "@/lib/tenantGuard";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

/* =======================================================
   PUT  /api/v1/tenants/{schoolId}/users/admins/{id}
======================================================= */

const client = await clerkClient();

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {

    /* 1️⃣ PARAMS */

    const { id } = await context.params;

    /* 2️⃣ VALIDATE INPUT */

    const body = await req.json();
    const data = adminSchema.parse(body);

    /* 3️⃣ TENANT ACCESS */

    const { access, error } = await tenantGuard();
    if (error) return error;

    if (access.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const schoolId = access.schoolId;

    /* 4️⃣ VERIFY ADMIN EXISTS */

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Admin not found in this tenant" },
        { status: 404 }
      );
    }

    /* 5️⃣ SYNC IDENTITY */

    const identity = await createOrUpdateIdentity({
      username: data.username,
      phone: data.phone,
      name: data.name,
      role: "admin",
      schoolId,
    });

    /* 6️⃣ UPDATE ADMIN ENTITY */

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
        img: data.img ?? null,
        phone: data.phone,
        clerk_id: identity.clerkId,
        profileId: identity.profileId,
        linkedUserId: identity.linkedUserId,
      },
    });

    return NextResponse.json(
      { success: true, updatedAdmin },
      { status: 200 }
    );

  } catch (error: any) {

    console.error("Admin update error:", error);

    return NextResponse.json(
      {
        error: error?.errors || error?.message || "Internal Server Error",
      },
      { status: error.name === "ZodError" ? 400 : 500 }
    );
  }
}

/* =======================================================
   DELETE  /api/v1/tenants/{schoolId}/users/admins/{id}
======================================================= */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await context.params;

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

    /* 2️⃣ Fetch admin */

    const admin = await prisma.admin.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    /* 3️⃣ Prevent deleting yourself */

    if (admin.clerk_id === access.userId) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    /* 4️⃣ Validate required fields */

    if (!admin.profileId || !admin.linkedUserId) {
      return NextResponse.json(
        { error: "Admin identity is corrupted" },
        { status: 500 }
      );
    }

    /* 5️⃣ Check if other roles exist */

    const otherUsers = await prisma.linkedUser.findMany({
      where: {
        profileId: admin.profileId,
        NOT: {
          id: admin.linkedUserId,
        },
      },
    });

    /* 6️⃣ Delete admin entity */

    await prisma.admin.delete({
      where: { id },
    });

    /* 7️⃣ Delete linkedUser */

    await prisma.linkedUser.delete({
      where: { id: admin.linkedUserId },
    });

    /* 8️⃣ Delete Clerk user if no other roles */

    if (otherUsers.length === 0 && admin.clerk_id) {
      const client = await clerkClient();
      await client.users.deleteUser(admin.clerk_id);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {

    console.error("Delete admin error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
