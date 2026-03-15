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

  /* =====================================================
     1️⃣ Find profile by phone (parent identity)
  ===================================================== */

  let profile = await prisma.profile.findFirst({
    where: { phone },
  });

  let clerkId: string;

  /* =====================================================
     2️⃣ Existing parent (reuse Clerk user)
  ===================================================== */

  if (profile?.clerk_id) {

    clerkId = profile.clerk_id;

    try {

      await client.users.getUser(clerkId);

      await client.users.updateUser(clerkId, {
        firstName: name,
        publicMetadata: {
          role,
          schoolId,
        },
      });

    } catch (err: any) {

      // Clerk user no longer exists → recreate
      if (err.status === 404) {

        const newUser = await client.users.createUser({
          username: `s${phone}`,
          password: password ?? phone,
          firstName: name,
          skipPasswordChecks: true,
          publicMetadata: {
            role,
            schoolId,
          },
        });

        clerkId = newUser.id;

        await prisma.profile.update({
          where: { id: profile.id },
          data: { clerk_id: clerkId },
        });

      } else {
        throw err;
      }

    }
  } else {

    /* =====================================================
       3️⃣ Check if Clerk user exists by username (phone)
    ===================================================== */

    let clerkUser;

    const existingClerk = await client.users.getUserList({
      username: [phone],
    });

    if (existingClerk.data.length > 0) {

      clerkUser = existingClerk.data[0];

      console.log("Reusing existing Clerk user:", clerkUser.id);

    } else {

      /* ---------- Create new Clerk user ---------- */

      clerkUser = await client.users.createUser({
        username: phone, // phone used as login username
        password: password ?? phone,
        skipPasswordChecks: true,
        firstName: name,
        publicMetadata: {
          role,
          schoolId,
        },
      });

    }

    clerkId = clerkUser.id;

    /* =====================================================
       4️⃣ Create parent profile
    ===================================================== */

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
     5️⃣ Link user to school
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
     6️⃣ Set active role
  ===================================================== */

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      activeUserId: linkedUser.id,
    },
  });

  /* =====================================================
     7️⃣ Return identity
  ===================================================== */

  return {
    clerkId,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
  };
}