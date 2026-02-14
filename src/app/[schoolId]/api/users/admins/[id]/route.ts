// src/app/api/users/admin/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminId = (id);
    const body = await req.json();

    const data = adminSchema.parse({
      ...body,
      id: adminId,
    });

    // Get existing admin to fetch Clerk ID
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin || !existingAdmin.clerk_id) {
      return NextResponse.json(
        { success: false, error: "Admin or associated Clerk user not found" },
        { status: 404 }
      );
    }

    // Log incoming phone number for debugging
    console.log("Updating phone number for Clerk user with ID:", existingAdmin.clerk_id);
    console.log("Phone number:", `+91${data.phone}`);

    // Step 1: Get the Clerk user details
    const user = await client.users.getUser(existingAdmin.clerk_id);

    const formattedNewPhone = `+91${data.phone}`;

    // Step 2: Check if the new phone number is already associated with this user
    const existingPhone = user.phoneNumbers.find(
      (phone) => phone.phoneNumber === formattedNewPhone
    );

    const isPrimary =
      existingPhone && existingPhone.id === user.primaryPhoneNumberId;

    if (existingPhone && isPrimary) {
      console.log("Phone number is already the current primary. Skipping phone update.");

      // Still update user details (without touching the phone)
      await client.users.updateUser(existingAdmin.clerk_id, {
        firstName: data.name,
        username: data.username,
        password: data.password,
      });

      // And update admin record in DB
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data,
      });

      return NextResponse.json({ success: true, updatedAdmin }, { status: 200 });
    }

    if (existingPhone && !isPrimary) {
      return NextResponse.json(
        { success: false, error: "Phone number already associated with this user" },
        { status: 422 }
      );
    }

    // Step 3: Create the new phone number
    const newPhone = await client.phoneNumbers.createPhoneNumber({
      userId: existingAdmin.clerk_id,
      phoneNumber: formattedNewPhone,
    });

    // Step 4: Mark the new phone number as verified
    await client.phoneNumbers.updatePhoneNumber(newPhone.id, {
      verified: true,
    });

    // Step 5: Set the new phone as primary
    await client.users.updateUser(existingAdmin.clerk_id, {
      primaryPhoneNumberID: newPhone.id,
    });

    // Step 6: Delete the old phone number(s), leaving the newly added one as primary
    const oldPhones = user.phoneNumbers.filter(
      (phone) => phone.id !== newPhone.id
    );

    for (const oldPhone of oldPhones) {
      console.log(`Deleting old phone number with ID: ${oldPhone.id}`);
      await client.phoneNumbers.deletePhoneNumber(oldPhone.id);
    }

    // Step 7: Update user details (such as full name, username, password) in Clerk
    await client.users.updateUser(existingAdmin.clerk_id, {
      firstName: data.name,
      username: data.username,
      password: data.password,
    });

    // Step 8: Update admin in the database
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data,
    });

    return NextResponse.json({ success: true, updatedAdmin }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/users/admin/[id] error:", error);

    // Log Clerk-specific error details if available
    if (error.errors) {
      console.error("Clerk error details:", error.errors);
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.name === "ZodError" ? 400 : 500 }
    );
  }
}




// DELETE /api/users/admin/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = (id);

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: true, message: "No valid ID provided" },
        { status: 400 }
      );
    }

    // Fetch the admin to check if it exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: true, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Delete Clerk user if associated
    if (admin.clerk_id) {
      await client.users.deleteUser(admin.clerk_id);
    }

    // Delete the admin from Prisma
    await prisma.admin.delete({
      where: { id: adminId },
    });

    return NextResponse.json(
      { success: true, error: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { success: false, error: true, message: "Delete failed" },
      { status: 500 }
    );
  }
}