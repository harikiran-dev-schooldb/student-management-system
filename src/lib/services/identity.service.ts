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
  const phoneNumber = `+91${phone}`;

  /* ---------- 1️⃣ Find Clerk User ---------- */

  const existing = await client.users.getUserList({
    phoneNumber: [phoneNumber],
  });

  let clerkUser;

  if (existing.data.length > 0) {
    clerkUser = existing.data[0];

    /* ---------- Update Clerk ---------- */

    await client.users.updateUser(clerkUser.id, {
      username,
      firstName: name,
      publicMetadata: { role },
    });

  } else {

    /* ---------- Create Clerk ---------- */

    clerkUser = await client.users.createUser({
      username,
      password: password ?? phone,
      firstName: name,
      phoneNumber: [phoneNumber],
      publicMetadata: { role },
    });

  }

  /* ---------- 2️⃣ Profile ---------- */

  const profile = await prisma.profile.upsert({
    where: { clerk_id: clerkUser.id },
    update: {
      phone,
    },
    create: {
      clerk_id: clerkUser.id,
      phone,
    },
  });

  /* ---------- 3️⃣ LinkedUser ---------- */

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

  /* ---------- 4️⃣ Activate Role ---------- */

  await prisma.profile.update({
    where: { id: profile.id },
    data: { activeUserId: linkedUser.id },
  });

  return {
    clerkId: clerkUser.id,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
  };
}