import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { teacherschema } from '@/lib/formValidationSchemas';
import { toast } from 'react-toastify';

// Clerk client setup
const client = await clerkClient();
type ClerkUser = Awaited<ReturnType<typeof client.users.getUser>>;

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const body = await req.json();

    const result = teacherschema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      id: requestedId,
      username,
      password,
      name,
      phone,
      parentName,
      address,
      dob,
      email,
      gender,
      bloodType,
      img,
      subjects,
    } = result.data;

    const id = requestedId ?? username;
    const generatedUsername = username;
    const finalPassword = password && password !== "" ? password : phone;
    const phoneNumber = `+91${phone}`;

    /* -----------------------------
       1️⃣ CLERK USER
    ------------------------------ */

    const existingUsers = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    let teacherUser;

    if (existingUsers.data.length > 0) {
      teacherUser = existingUsers.data[0];
    } else {
      teacherUser = await client.users.createUser({
        username: generatedUsername,
        password: finalPassword,
        firstName: name,
        phoneNumber: [phoneNumber],
      });

      await client.users.updateUser(teacherUser.id, {
        publicMetadata: { role: "teacher" },
      });
    }

    /* -----------------------------
       2️⃣ PROFILE (NO schoolId here)
    ------------------------------ */

    let profile = await prisma.profile.findUnique({
      where: { clerk_id: teacherUser.id },
      include: { users: true },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          phone,
          clerk_id: teacherUser.id,
        },
        include: { users: true },
      });
    }

    /* -----------------------------
       3️⃣ LINKED USER (NOW WITH schoolId)
    ------------------------------ */

    const existingRole = await prisma.linkedUser.findFirst({
      where: {
        username: generatedUsername,
        schoolId, // ✅ tenant safe
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: `Teacher username "${generatedUsername}" already exists!` },
        { status: 409 }
      );
    }

    const role = await prisma.linkedUser.create({
      data: {
        role: "teacher",
        username: generatedUsername,
        profileId: profile.id,
        schoolId, // ✅ REQUIRED
      },
    });

    if (!profile.activeUserId) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { activeUserId: role.id },
      });
    }

    /* -----------------------------
       4️⃣ CREATE TEACHER (Tenant Safe)
    ------------------------------ */

    const duplicateTeacher = await prisma.teacher.findFirst({
      where: {
        username: generatedUsername,
        schoolId, // ✅ IMPORTANT
      },
    });

    if (duplicateTeacher) {
      return NextResponse.json(
        { message: `Teacher username "${generatedUsername}" already exists.` },
        { status: 409 }
      );
    }

    const teacher = await prisma.teacher.create({
      data: {
        id,
        username: generatedUsername,
        name,
        parentName: parentName ?? null,
        dob: dob ? new Date(dob) : new Date(),
        email: email ?? null,
        phone,
        address,
        gender,
        clerk_id: teacherUser.id,
        img: img ?? null,
        bloodType: bloodType ?? "Under Investigation",
        profileId: profile.id,
        linkedUserId: role.id,
        schoolId, // ✅ REQUIRED
      },
    });

    /* -----------------------------
       5️⃣ SUBJECT ASSIGNMENT (Tenant Safe)
    ------------------------------ */

    if (subjects && Array.isArray(subjects)) {
      const validSubjects = subjects.filter(
        (sub: any) => sub.subjectId && sub.classId
      );

      if (validSubjects.length > 0) {
        await prisma.subjectTeacher.createMany({
          data: validSubjects.map((sub: any) => ({
            subjectId: sub.subjectId,
            classId: sub.classId,
            teacherId: teacher.id,
            schoolId, // ✅ REQUIRED
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json(teacher, { status: 201 });

  } catch (error: any) {
    console.error("Teacher creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate record (username exists)." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
