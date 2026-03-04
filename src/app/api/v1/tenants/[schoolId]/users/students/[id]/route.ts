export const dynamic = "force-dynamic";
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

    const user = await fetchUserInfo(schoolSlug);
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

    /* ---- Validate student belongs to school ---- */
    const existingStudent = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: { enrollments: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    /* ---- Get Active Academic Year ---- */
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 },
      );
    }

    if (!data.dob) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 },
      );
    }

    const dob = new Date(data.dob);

    /* =========================================================
       TRANSACTION
    ========================================================= */
    const updatedStudent = await prisma.$transaction(async (tx) => {

      /* ---- Update Student Core Fields ---- */
      const student = await tx.student.update({
        where: { id: studentId },
        data: {
          name: data.name,
          fatherName: data.fatherName ?? null,
          motherName: data.motherName ?? null,
          email: data.email ?? null,
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          bloodType: data.bloodType ?? null,
          penNo: data.penNo ?? null,
          motherAadhar: data.motherAadhar ?? null,
          fatherAadhar: data.fatherAadhar ?? null,
          studentAadhar: data.studentAadhar ?? null,
          img: data.img ?? null,
          dob,
        },
      });

      /* ---- Update Enrollment (Class Change) ---- */
      const currentEnrollment = existingStudent.enrollments.find(
        (e) => e.academicYearId === academicYear.id
      );

      if (!currentEnrollment) {
        throw new Error("Enrollment record not found for active year");
      }

      if (data.classId && data.classId !== currentEnrollment.classId) {
        await tx.studentEnrollment.update({
          where: { id: currentEnrollment.id },
          data: { classId: data.classId },
        });
      }

      return student;
    });

    revalidatePath(`/${schoolSlug}/list/users/students`);

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    });

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

    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = await resolveSchoolId(schoolSlug);

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

    const user = await fetchUserInfo(schoolSlug);

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
