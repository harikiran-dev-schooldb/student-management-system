import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { teacherschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* =====================================================
       1️⃣ Resolve Tenant + Authorize
    ===================================================== */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const currentUser = await fetchUserInfo(schoolSlug);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================================================
       2️⃣ Parse Input
    ===================================================== */
    const { teachers } = await req.json();

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return NextResponse.json(
        { error: "Invalid teachers array" },
        { status: 400 }
      );
    }

    if (teachers.length > 2000) {
      return NextResponse.json(
        { error: "Upload limit exceeded (max 2000)" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    /* =====================================================
       3️⃣ Preload Valid Classes
    ===================================================== */
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true },
    });

    const validClassSet = new Set(classes.map((c) => c.id));

    /* =====================================================
       4️⃣ Process Teachers
    ===================================================== */
    for (let i = 0; i < teachers.length; i++) {
      const t = teachers[i];

      try {
        if (
          !t.id ||
          !t.username ||
          !t.name ||
          !t.phone ||
          !t.address ||
          !t.gender
        ) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          skipped++;
          continue;
        }

        const teacherId = t.id ?? t.username;
        const phoneNumber = `+91${t.phone}`;
        const finalPassword = t.password && t.password !== "" ? t.password : t.phone;

        /* -----------------------------
           Prevent duplicate inside tenant
        ------------------------------ */
        const existingTeacher = await prisma.teacher.findUnique({
          where: {
            username_schoolId: {
              username: t.username.trim(),
              schoolId,
            },
          },
        });

        if (existingTeacher) {
          errors.push(`Duplicate skipped: ${t.username}`);
          skipped++;
          continue;
        }

        /* -----------------------------
           Clerk User
        ------------------------------ */
        const existingUsers = await client.users.getUserList({
          phoneNumber: [phoneNumber],
        });

        let clerkUser;

        if (existingUsers.data.length > 0) {
          clerkUser = existingUsers.data[0];
        } else {
          clerkUser = await client.users.createUser({
            username: t.username.trim(),
            password: finalPassword,
            firstName: t.name,
            phoneNumber: [phoneNumber],
          });

          await client.users.updateUser(clerkUser.id, {
            publicMetadata: { role: "teacher" },
          });
        }

        /* -----------------------------
           Transaction
        ------------------------------ */
        await prisma.$transaction(async (tx) => {
          /* Profile */
          const profile = await tx.profile.upsert({
            where: { clerk_id: clerkUser.id },
            update: {},
            create: {
              clerk_id: clerkUser.id,
              phone: t.phone,
            },
          });

          /* LinkedUser */
          const linkedUser = await tx.linkedUser.create({
            data: {
              username: t.username.trim(),
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

          /* Teacher */
          await tx.teacher.create({
            data: {
              id: teacherId,
              username: t.username.trim(),
              name: t.name,
              parentName: t.parentName ?? null,
              dob: t.dob ? new Date(t.dob) : null,
              email: t.email ?? null,
              phone: t.phone,
              address: t.address,
              gender: t.gender,
              bloodType: t.bloodType ?? null,
              img: t.img ?? null,
              clerk_id: clerkUser.id,
              profileId: profile.id,
              linkedUserId: linkedUser.id,
              classId:
                t.classId && validClassSet.has(Number(t.classId))
                  ? Number(t.classId)
                  : null,
              schoolId,
            },
          });
        });

        created++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
        skipped++;
      }
    }

    /* =====================================================
       5️⃣ Response
    ===================================================== */
    return NextResponse.json({
      message: "Bulk teacher upload completed",
      created,
      skipped,
      total: teachers.length,
      errors,
    });

  } catch (error) {
    console.error("Bulk Teacher Upload Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}