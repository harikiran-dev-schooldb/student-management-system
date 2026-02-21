import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { teacherschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {
  try {
    /* =====================================================
       1️⃣ Resolve Tenant + Authorize
    ===================================================== */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const currentUser = await fetchUserInfo(schoolId);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================================================
       2️⃣ Validate Input
    ===================================================== */
    const body = await req.json();
    const parsed = teacherschema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
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
    } = parsed.data;

    const teacherId = requestedId ?? username;
    const phoneNumber = `+91${phone}`;
    const finalPassword = password && password !== "" ? password : phone;

    const client = await clerkClient();

    /* =====================================================
       3️⃣ Prevent Duplicate Username (Tenant Safe)
    ===================================================== */
    const duplicateTeacher = await prisma.teacher.findUnique({
      where: {
        username_schoolId: {
          username,
          schoolId,
        },
      },
    });

    if (duplicateTeacher) {
      return NextResponse.json(
        { error: `Teacher "${username}" already exists.` },
        { status: 409 }
      );
    }

    /* =====================================================
       4️⃣ Clerk User (Global)
    ===================================================== */
    const existingUsers = await client.users.getUserList({
      phoneNumber: [phoneNumber],
    });

    let clerkUser;

    if (existingUsers.data.length > 0) {
      clerkUser = existingUsers.data[0];
    } else {
      clerkUser = await client.users.createUser({
        username,
        password: finalPassword,
        firstName: name,
        phoneNumber: [phoneNumber],
      });

      await client.users.updateUser(clerkUser.id, {
        publicMetadata: { role: "teacher" },
      });
    }

    /* =====================================================
       5️⃣ Transaction (Profile + LinkedUser + Teacher)
    ===================================================== */
    const teacher = await prisma.$transaction(async (tx) => {
      /* ----- Profile ----- */
      const profile = await tx.profile.upsert({
        where: { clerk_id: clerkUser.id },
        update: {},
        create: {
          clerk_id: clerkUser.id,
          phone,
        },
      });

      /* ----- LinkedUser (Tenant Scoped) ----- */
      const linkedUser = await tx.linkedUser.create({
        data: {
          username,
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

      /* ----- Teacher ----- */
      const newTeacher = await tx.teacher.create({
        data: {
          id: teacherId,
          username,
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

      /* ----- Subject Assignment (Tenant Safe) ----- */
      if (subjects && Array.isArray(subjects)) {
        const validSubjects = subjects.filter(
          (s: any) => s.subjectId && s.classId
        );

        if (validSubjects.length > 0) {
          /* Validate subjects belong to this school */
          const subjectIds = validSubjects.map((s: any) => s.subjectId);

          const validSubjectRecords = await tx.subject.findMany({
            where: {
              id: { in: subjectIds },
              schoolId,
            },
            select: { id: true },
          });

          if (validSubjectRecords.length !== subjectIds.length) {
            throw new Error("Invalid subject assignment detected.");
          }

          await tx.subjectTeacher.createMany({
            data: validSubjects.map((s: any) => ({
              subjectId: s.subjectId,
              classId: s.classId,
              teacherId: teacherId,
              schoolId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return newTeacher;
    });

    return NextResponse.json(
      { success: true, data: teacher },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Teacher creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate record detected." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}