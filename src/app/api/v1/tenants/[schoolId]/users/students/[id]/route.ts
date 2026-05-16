export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { studentschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { revalidatePath } from "next/cache";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

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

    /* ---------- Resolve School ---------- */

    const schoolId = await resolveSchoolId(schoolSlug);

    /* ---------- Auth ---------- */

    const user = await fetchUserInfo(schoolSlug);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ---------- Validate Body ---------- */

    const body = await req.json();
    const parsed = studentschema.safeParse({ ...body, id: studentId });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    /* ---------- Get Student ---------- */

    const existingStudent = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: { enrollments: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    /* ---------- Identity Sync ---------- */

    const phoneChanged = existingStudent.phone !== data.phone;

    if (phoneChanged) {
      const identity = await createOrUpdateIdentity({
        username: existingStudent.username,
        phone: data.phone,
        name: data.name,
        role: "student",
        schoolId,
      });

      await prisma.student.update({
        where: { id: studentId },
        data: { clerk_id: identity.clerkId },
      });
    }

    /* ---------- Active Academic Year ---------- */

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
    const normalize = (val?: string | null) =>
      val && val.trim() !== "" ? val : null;

    /* ---------- Transaction ---------- */

    const updatedStudent = await prisma.$transaction(async (tx) => {

      const student = await tx.student.update({
        where: { id: studentId },
        data: {
          name: data.name,
          fatherName: data.fatherName ?? null,
          motherName: data.motherName ?? null,
          fatherQualification: normalize(data.fatherQualification),
          fatherProfession: normalize(data.fatherProfession),
          motherQualification: normalize(data.motherQualification),
          motherProfession: normalize(data.motherProfession),
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
          joinedDate: data.joinedDate ? new Date(data.joinedDate) : null,
          nationality: normalize(data.nationality),
          motherTongue: normalize(data.motherTongue),
          religion: data.religion ?? null,
          category: data.category ?? null,
          transportRequired: data.transportRequired ?? false,
          hostelRequired: data.hostelRequired ?? false,
        },
      });

      /* ---------- Enrollment Update ---------- */

      const currentEnrollment = existingStudent.enrollments.find(
        (e) => e.academicYearId === academicYear.id
      );

      if (!currentEnrollment) {
        throw new Error("Enrollment not found for active academic year");
      }

      if (data.classId && data.classId !== currentEnrollment.classId) {
        await tx.studentEnrollment.update({
          where: { id: currentEnrollment.id },
          data: { classId: data.classId },
        });
      }

      return student;
    });

    /* ---------- Revalidate ---------- */

    revalidatePath(`/${schoolSlug}/list/users/students`);

    return NextResponse.json({
      success: true,
      data: updatedStudent,
    });

  } catch (error) {
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

    /* ---------- Resolve School ---------- */

    const schoolId = await resolveSchoolId(schoolSlug);

    /* ---------- Auth ---------- */

    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ---------- Validate Body ---------- */

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    /* ---------- Ensure Student Belongs To School ---------- */

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    /* ---------- Update Status ---------- */

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { status },
    });

    /* ---------- Revalidate ---------- */

    revalidatePath(`/${schoolSlug}/list/users/students`);

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("Student PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

export async function GET(

  req: NextRequest,

  {

    params,

  }: {

    params: Promise<{
      schoolId: string;
      id: string;
    }>;
  }

) {

  try {

    const { id } = await params;

    const student = await prisma.student.findUnique({
  where: {
    id,
  },

  include: {
    enrollments: {
      include: {
        class: {
          include: {
            Grade: true,
          },
        },
      },
    },
  },
});

    if (!student) {

      return NextResponse.json(

        {

          error: "Student not found",

        },

        {

          status: 404,

        }

      );

    }

    return NextResponse.json({
  success: true,

  data: {
    id: student.id,
    name: student.name,
    fatherName: student.fatherName,
    admissionNo: student.admissionNo,
    img: student.img,
    phone: student.phone,
    email: student.email,
    gender: student.gender,
    bloodType: student.bloodType,
    className:
      student.enrollments?.[0]?.class?.name || null,
    section:
      student.enrollments?.[0]?.class?.section || null,
    grade:
      student.enrollments?.[0]?.class?.Grade?.level || null,
  },
});
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Failed to fetch student",
      },
      {
        status: 500,
      }
    );
  }
}
