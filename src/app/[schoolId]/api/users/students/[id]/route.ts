// src/app/api/users/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { studentschema } from "@/lib/formValidationSchemas";
import { revalidatePath } from "next/cache";

const client = await clerkClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = id;
    const body = await req.json();

    // ✅ Validate with Zod
    const parsed = studentschema.safeParse({ ...body, id: studentId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 🔍 Find existing student
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { linkedUser: true },
    });

    if (!existingStudent || !existingStudent.clerk_id) {
      return NextResponse.json(
        { success: false, error: "Student or associated Clerk user not found" },
        { status: 404 }
      );
    }

    const user = await client.users.getUser(existingStudent.clerk_id);
    const formattedPhone = `+91${data.phone}`;
    const updatedUsername = `s${studentId}`;

    // 🔑 Compare new vs old phone
    const currentPhone = user.phoneNumbers.find(
      (ph) => ph.id === user.primaryPhoneNumberId
    )?.phoneNumber;

    if (formattedPhone !== currentPhone) {
      try {
        // Add new phone
        const newPhone = await client.phoneNumbers.createPhoneNumber({
          userId: existingStudent.clerk_id,
          phoneNumber: formattedPhone,
        });

        await client.phoneNumbers.updatePhoneNumber(newPhone.id, {
          verified: true,
        });

        // Make it primary
        await client.users.updateUser(existingStudent.clerk_id, {
          primaryPhoneNumberID: newPhone.id,
        });

        // Remove old numbers
        for (const ph of user.phoneNumbers) {
          if (ph.phoneNumber !== formattedPhone) {
            await client.phoneNumbers.deletePhoneNumber(ph.id);
          }
        }
      } catch (err: any) {
        if (err.errors?.[0]?.code === "form_identifier_exists") {
          return NextResponse.json(
            { success: false, error: "Phone number already exists in another account" },
            { status: 400 }
          );
        }
        throw err;
      }
    }

    // ✅ Update Clerk user basic info
    await client.users.updateUser(existingStudent.clerk_id, {
      firstName: data.name,
    });

    // ✅ Update Student in Prisma
    const { dob, classId, gradeId, ...otherData } = data;

    const studentData: any = {
      ...otherData,
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(classId ? { Class: { connect: { id: Number(classId) } } } : {}),
    };

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: studentData,
      include: {
        Class: {
          include: {
            Grade: true,
          },
        },
      },
    });

    // ✅ Sync LinkedUser + Profile
    if (existingStudent.linkedUser) {
      await prisma.linkedUser.update({
        where: { id: existingStudent.linkedUser.id },
        data: {
          username: updatedUsername,
          profile: {
            update: {
              phone: data.phone,
            },
          },
        },
      });
    }

    revalidatePath("/list/users/students");

    return NextResponse.json({ success: true, updatedStudent }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/users/students/[id] error:", error);
    if (error.errors) console.error("Clerk error details:", error.errors);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.name === "ZodError" ? 400 : 500 }
    );
  }
}

// 🚀 Hard DELETE endpoint
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = id;

    // 🔍 Find student with linked data
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { linkedUser: true },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // 🔍 Check if any other student has the same phone number
    const otherStudentsWithSamePhone = await prisma.student.findMany({
      where: {
        phone: existingStudent.phone,
        id: { not: studentId }, // exclude current student
      },
    });

    // 🗑️ Delete Clerk user only if no other student has the same phone
    if (existingStudent.clerk_id && otherStudentsWithSamePhone.length === 0) {
      try {
        await client.users.deleteUser(existingStudent.clerk_id);
      } catch (err) {
        console.warn(
          "Warning: Clerk user not deleted, may not exist.",
          existingStudent.clerk_id
        );
      }
    }

    // 🗑️ Delete linkedUser if exists
    if (existingStudent.linkedUser) {
      await prisma.linkedUser.delete({
        where: { id: existingStudent.linkedUser.id },
      });
    }

    // 🗑️ Delete Student
    await prisma.student.delete({
      where: { id: studentId },
    });

    revalidatePath("/list/users/students");

    return NextResponse.json(
      { success: true, message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/users/students/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // ✅ Update student status
    const updatedStudent = await prisma.student.update({
      where: { id: (id) },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}