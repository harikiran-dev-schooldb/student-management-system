export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {

    /* 1️⃣ Resolve tenant */

    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);

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

    const client = await clerkClient();

    const phoneNumber = `+91${phone}`;

    const finalPassword =
      password && password !== "" ? password : phone;

    /* 5️⃣ Clerk user */

    const existingUsers = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    let clerkUser;

    if (existingUsers.data.length > 0) {
      clerkUser = existingUsers.data[0];
    } else {

      clerkUser = await client.users.createUser({
        username: username.trim(),
        password: finalPassword,
        firstName: name,
        phoneNumber: [phoneNumber],
      });

      await client.users.updateUser(clerkUser.id, {
        publicMetadata: { role: "teacher" },
      });
    }

    /* 6️⃣ Transaction */

    const result = await prisma.$transaction(async (tx) => {

      const profile = await tx.profile.upsert({
        where: { clerk_id: clerkUser.id },
        update: {},
        create: {
          clerk_id: clerkUser.id,
          phone,
        },
      });

      const linkedUser = await tx.linkedUser.create({
        data: {
          username: username.trim(),
          role: "teacher",
          profileId: profile.id,
          schoolId,
        },
      });

      if (!profile.activeUserId) {
        await tx.profile.update({
          where: { id: profile.id },
          data: { activeUserId: linkedUser.id },
        });
      }

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
          clerk_id: clerkUser.id,
          profileId: profile.id,
          linkedUserId: linkedUser.id,
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
            academicYearId: "",
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