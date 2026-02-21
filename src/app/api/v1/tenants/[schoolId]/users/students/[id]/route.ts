import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { studentschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/* ======================================================
   PUT → Update Student (Admin Only, Tenant Safe)
====================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* ---------- Authorization ---------- */
    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = studentschema.safeParse({ ...body, id: studentId });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    /* ---------- Ensure Student Belongs To School ---------- */
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
      include: { linkedUser: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const client = await clerkClient();

    /* ---------- Clerk Update (Phone + Name) ---------- */
    if (existingStudent.clerk_id) {
      const formattedPhone = `+91${data.phone}`;
      const clerkUser = await client.users.getUser(existingStudent.clerk_id);

      const currentPhone =
        clerkUser.phoneNumbers.find(
          (ph) => ph.id === clerkUser.primaryPhoneNumberId,
        )?.phoneNumber ?? null;

      if (formattedPhone !== currentPhone) {
        try {
          const newPhone = await client.phoneNumbers.createPhoneNumber({
            userId: existingStudent.clerk_id,
            phoneNumber: formattedPhone,
          });

          await client.phoneNumbers.updatePhoneNumber(newPhone.id, {
            verified: true,
          });

          await client.users.updateUser(existingStudent.clerk_id, {
            primaryPhoneNumberID: newPhone.id,
          });
        } catch (err: any) {
          if (err.errors?.[0]?.code === "form_identifier_exists") {
            return NextResponse.json(
              { error: "Phone number already exists" },
              { status: 400 },
            );
          }
          throw err;
        }
      }

      await client.users.updateUser(existingStudent.clerk_id, {
        firstName: data.name,
      });
    }

    /* ---------- Prisma Update ---------- */
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: data.name,
        fatherName: data.fatherName,
        motherName: data.motherName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        bloodType: data.bloodType,
        penNo: data.penNo,
        motherAadhar: data.motherAadhar,
        fatherAadhar: data.fatherAadhar,
        studentAadhar: data.studentAadhar,
        ...(data.dob ? { dob: new Date(data.dob) } : {}),
        ...(data.classId ? { classId: Number(data.classId) } : {}),
      },
      include: {
        Class: { include: { Grade: true } },
      },
    });

    /* ---------- Sync LinkedUser ---------- */
    if (existingStudent.linkedUser) {
      await prisma.linkedUser.update({
        where: { id: existingStudent.linkedUser.id },
        data: {
          username: `s${studentId}`,
        },
      });
    }

    revalidatePath(`/${schoolSlug}/list/users/students`);

    return NextResponse.json(
      { success: true, data: updatedStudent },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Student PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: { linkedUser: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const client = await clerkClient();

    await prisma.$transaction(async (tx) => {
      if (student.linkedUser) {
        await tx.linkedUser.delete({
          where: { id: student.linkedUser.id },
        });
      }

      await tx.student.delete({
        where: { id: studentId },
      });
    });

    if (student.clerk_id) {
      try {
        await client.users.deleteUser(student.clerk_id);
      } catch {
        console.warn("Clerk user not deleted");
      }
    }

    revalidatePath(`/${schoolSlug}/list/users/students`);

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Student DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    const { schoolId: schoolSlug, id: studentId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);
    const user = await fetchUserInfo(schoolId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Student PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
