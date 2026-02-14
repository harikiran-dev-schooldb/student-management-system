import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { teacherschema } from '@/lib/formValidationSchemas';
import { toast } from 'react-toastify';

// Clerk client setup
const client = await clerkClient();
type ClerkUser = Awaited<ReturnType<typeof client.users.getUser>>;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Step 1: Validate input
    const result = teacherschema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { message: 'Validation failed', errors },
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

    console.log('Received teacher data:', result.data);

    // ✅ Step 2: Use provided username as Teacher ID
    const id = requestedId ?? username;
    const generatedUsername = username;
    const finalPassword = password && password !== '' ? password : phone;
    const phoneNumber = `+91${phone}`;

    const existingUsers = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    let teacherUser: ClerkUser;

    if (existingUsers.data.length > 0) {
      teacherUser = existingUsers.data[0];  // Reuse existing Clerk user
      console.log("Reusing existing Clerk user:", teacherUser.id);
    } else {
      teacherUser = await client.users.createUser({
        username: generatedUsername,
        password: finalPassword,
        firstName: name,
        phoneNumber: [phoneNumber],
      });

      await client.users.updateUser(teacherUser.id, {
        publicMetadata: { role: 'teacher' },
      });
    }


    console.log('Clerk Teacher User created:', teacherUser.id);

    // ✅ Step 4: Create or reuse Profile
    let profile = await prisma.profile.findUnique({
      where: { clerk_id: teacherUser.id },
      include: { users: true, activeUser: true },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          phone,
          clerk_id: teacherUser.id,
        },
        include: { users: true, activeUser: true },
      });
      console.log('New Profile created:', profile);
    } else {
      console.log('Existing Profile reused:', profile);
    }

    // ✅ Step 5: Ensure Linked Role (teacher) exists
    const existingRole = await prisma.linkedUser.findFirst({
      where: { username: generatedUsername },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: `Teacher username "${generatedUsername}" already exists!` },
        { status: 409 }
      );
    }

    const role = await prisma.linkedUser.create({
      data: {
        role: 'teacher',
        username: generatedUsername,
        profileId: profile.id,
      },
    });
    console.log('New Role created:', role);

    // If profile has no active role yet, set this role as active
    if (!profile.activeUserId) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { activeUserId: role.id },
      });
      console.log('Active role set for profile:', role.id);
    }

    // ✅ Step 6: Create Teacher record
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username: generatedUsername },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { message: `Teacher username "${generatedUsername}" already exists in DB!` },
        { status: 409 }
      );
    }

    const teacherData: any = {
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
      bloodType: bloodType ?? 'Under Investigation',
      profileId: profile.id,
      linkedUserId: role.id,
    };

    const teacher = await prisma.teacher.create({ data: teacherData });

    console.log('Teacher created in DB:', teacher);

    // ✅ Step 7: Assign subjects
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
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json(teacher, { status: 201 });
    toast.success('Teacher created successfully!');
  } catch (error: any) {
    console.error('Error details:', JSON.stringify(error, null, 2));

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Unique constraint failed (probably username exists).' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const id = searchParams.get("id");
    const classId = searchParams.get("classId");
    const gender = searchParams.get("gender");

    const whereClause: any = {};

    // 🎯 Filter by ID
    if (id) {
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
          profile: { include: { users: true, activeUser: true } },
          subjects: { include: { subject: true, class: true } },
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { message: `Teacher with id "${id}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(teacher, { status: 200 });
    }

    // 🎯 Filter by Username
    if (username) {
      const teacher = await prisma.teacher.findUnique({
        where: { username },
        include: {
          profile: { include: { users: true, activeUser: true } },
          subjects: { include: { subject: true, class: true } },
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { message: `Teacher with username "${username}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(teacher, { status: 200 });
    }

    // 🎯 Add gender filter
    if (gender) {
      whereClause.gender = gender;
    }

    // 🎯 Add class filter (teachers who teach in a class)
    let teachers;
    if (classId) {
      teachers = await prisma.teacher.findMany({
        where: {
          ...whereClause,
          subjects: {
            some: { classId: classId },
          },
        },
        include: {
          profile: { include: { users: true, activeUser: true } },
          subjects: { include: { subject: true, class: true } },
        },
      });
    } else {
      teachers = await prisma.teacher.findMany({
        where: whereClause,
        include: {
          profile: { include: { users: true, activeUser: true } },
          subjects: { include: { subject: true, class: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(teachers, { status: 200 });
  } catch (error: any) {
    console.error("GET Teachers Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch teachers", error: error.message },
      { status: 500 }
    );
  }
}