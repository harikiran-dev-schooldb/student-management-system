// lib/services/identity.service.ts

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student" | "teacher" | "admin" | "principal" | "superadmin";
  schoolId: string;
};

export async function createOrUpdateIdentity({
  username,
  phone,
  name,
  role,
  schoolId,
}: IdentityInput) {

  const client = await clerkClient();

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  const fullPhone = `+91${normalizedPhone}`;

  /* =========================================
     1️⃣ Resolve Clerk user
  ========================================= */

  let clerkUser;

  const existing = await client.users.getUserList({
    externalId: [normalizedPhone],
  });

  if (existing.data.length > 0) {
    clerkUser = existing.data[0];
    console.log("Reusing existing Clerk user:", clerkUser.id);
  } else {
    try {
      clerkUser = await client.users.createUser({
        externalId: normalizedPhone,
        emailAddress: [`${normalizedPhone}@schooldb.com`],
        firstName: name || "User",
        password: crypto.randomUUID(),
        skipPasswordChecks: true,
      });
    } catch (err: any) {
      console.error("Clerk createUser error:", err?.errors);

      const retry = await client.users.getUserList({
        externalId: [normalizedPhone],
      });

      if (retry.data.length === 0) throw err;

      clerkUser = retry.data[0];
    }
  }

  const clerkId = clerkUser.id;

  /* =========================================
     2️⃣ Ensure profile exists
  ========================================= */

  const profile = await prisma.profile.upsert({
    where: { phone: normalizedPhone },
    update: { clerk_id: clerkId },
    create: {
      phone: normalizedPhone,
      clerk_id: clerkId,
    },
  });

  /* =========================================
     3️⃣ Link user to school
  ========================================= */

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

  /* =========================================
     4️⃣ Set active role
  ========================================= */

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      activeUserId: linkedUser.id,
    },
  });

  /* =========================================
     5️⃣ Sync metadata to Clerk
  ========================================= */
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role,
      schoolId,
      username,
      activeRoleId: linkedUser.id,
    },
  });


  /* =========================================
     5️⃣ Return identity
  ========================================= */

  return {
    clerkId,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
  };
}