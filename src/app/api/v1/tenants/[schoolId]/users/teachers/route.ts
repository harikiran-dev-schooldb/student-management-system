export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {

    /* 1️⃣ Resolve tenant */

    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 2️⃣ Parse input */

    const body = await req.json();

    const {
      username,
      name,
      parentName,
      dob,
      email,
      phone,
      address,
      gender,
      bloodType,
      img,
      classId,
      password,
    } = body;

    if (!username || !name || !phone || !address || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* 3️⃣ Prevent duplicate teacher */

    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        username_schoolId: {
          username: username.trim(),
          schoolId,
        },
      },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher already exists in this school" },
        { status: 409 }
      );
    }

    /* 4️⃣ Validate class */

    let validatedClassId: number | null = null;

    if (classId) {
      const cls = await prisma.class.findFirst({
        where: { id: Number(classId), schoolId },
        select: { id: true },
      });

      if (!cls) {
        return NextResponse.json(
          { error: "Invalid classId" },
          { status: 400 }
        );
      }

      validatedClassId = cls.id;
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: {
        schoolId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    /* 5️⃣ Identity (Clerk + Profile + LinkedUser) */

    const identity = await createOrUpdateIdentity({
      username: username.trim(),
      phone,
      name,
      role: "teacher",
      schoolId,
      password,
    });

    /* 6️⃣ Transaction */

    const result = await prisma.$transaction(async (tx) => {

      const teacher = await tx.teacher.create({
        data: {
          username: username.trim(),
          name,
          parentName: parentName ?? null,
          dob: dob ? new Date(dob) : null,
          email: email ?? null,
          phone,
          address,
          gender,
          bloodType: bloodType ?? null,
          img: img ?? null,
          clerk_id: identity.clerkId,
          profileId: identity.profileId,
          linkedUserId: identity.linkedUserId,
          schoolId,
        },
      });

      /* Optional class assignment */

      if (validatedClassId) {
        await tx.teacherClassAssignment.create({
          data: {
            teacherId: teacher.id,
            classId: validatedClassId,
            schoolId,
            academicYearId: activeYear.id,
            role: "SUPERVISOR",
          },
        });
      }

      return teacher;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Teacher created successfully",
        teacher: result,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error("Create Teacher Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}