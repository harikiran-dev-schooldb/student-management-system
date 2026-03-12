// lib/services/identity.service.ts

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student" | "teacher" | "admin" | "principal" | "superadmin";
  schoolId: string;
  password?: string;
};

export async function createOrUpdateIdentity({
  username,
  phone,
  name,
  role,
  schoolId,
  password,
}: IdentityInput) {

  const client = await clerkClient();

  /* ---------- Normalize Phone ---------- */

  const normalizedPhone = phone.startsWith("+")
    ? phone
    : `+91${phone}`;

  /* =====================================================
     1️⃣ Find profile by phone
  ===================================================== */

  let profile = await prisma.profile.findFirst({
    where: { phone },
  });

  let clerkId: string;

  /* =====================================================
     2️⃣ Update existing Clerk user
  ===================================================== */

  if (profile?.clerk_id) {

    clerkId = profile.clerk_id;

    const clerkUser = await client.users.getUser(clerkId);

    const currentPhone =
      clerkUser.phoneNumbers.find(
        (p) => p.id === clerkUser.primaryPhoneNumberId
      )?.phoneNumber ?? null;

    /* ---------- Update phone if changed ---------- */

    if (currentPhone !== normalizedPhone) {

      try {

        const newPhone = await client.phoneNumbers.createPhoneNumber({
          userId: clerkId,
          phoneNumber: normalizedPhone,
        });

        await client.phoneNumbers.updatePhoneNumber(newPhone.id, {
          verified: true,
        });

        await client.users.updateUser(clerkId, {
          primaryPhoneNumberID: newPhone.id,
        });

      } catch (err: any) {

        console.error("Clerk phone update error:", err.errors || err);

        if (err.errors?.[0]?.code === "form_identifier_exists") {
          throw new Error("Phone number already exists in Clerk");
        }

        throw err;
      }
    }

    /* ---------- Update name ---------- */

    await client.users.updateUser(clerkId, {
      firstName: name,
      publicMetadata: {
        role,
        schoolId,
      },
    });

  } else {

    /* =====================================================
       3️⃣ Create Clerk user
    ===================================================== */

    const clerkUser = await client.users.createUser({
      firstName: name,
      password: password ?? `Stu@${phone}`,
      phoneNumber: [normalizedPhone],
      publicMetadata: {
        role,
        schoolId,
      },
    });

    clerkId = clerkUser.id;

    /* ---------- Create or update profile ---------- */

    if (profile) {

      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          clerk_id: clerkId,
        },
      });

    } else {

      profile = await prisma.profile.create({
        data: {
          phone,
          clerk_id: clerkId,
        },
      });

    }
  }

  /* =====================================================
     4️⃣ Link user to school
  ===================================================== */

  const linkedUser = await prisma.linkedUser.upsert({
    where: {
      username_schoolId: {
        username,
        schoolId,
      },
    },
    update: {
      role,
      profileId: profile.id,
    },
    create: {
      username,
      role,
      profileId: profile.id,
      schoolId,
    },
  });

  /* =====================================================
     5️⃣ Set active role
  ===================================================== */

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      activeUserId: linkedUser.id,
    },
  });

  /* =====================================================
     6️⃣ Return identity
  ===================================================== */

  return {
    clerkId,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
  };
}