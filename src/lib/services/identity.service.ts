// lib/services/identity.service.ts

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student" | "teacher" | "admin";
  schoolId: string;
};

export async function provisionIdentity({
  username,
  phone,
  name,
  role,
  schoolId,
}: IdentityInput) {

  const client = await clerkClient();
  const phoneNumber = `+91${phone}`;

  /* ---------- 1️⃣ Create / Get Clerk User ---------- */
  const existing = await client.users.getUserList({
    phoneNumber: [phoneNumber],
  });

  const clerkUser =
    existing.data[0] ??
    (await client.users.createUser({
      username,
      password: phone,
      firstName: name,
      phoneNumber: [phoneNumber],
      publicMetadata: { role },
    }));

  /* ---------- 2️⃣ Create / Get Profile ---------- */
  const profile = await prisma.profile.upsert({
    where: { clerk_id: clerkUser.id },
    update: {
      phone, // keep phone updated
    },
    create: {
      clerk_id: clerkUser.id,
      phone,
    },
  });

  /* ---------- 3️⃣ Create / Get LinkedUser (Tenant Role) ---------- */
  const linkedUser = await prisma.linkedUser.upsert({
    where: {
      username_schoolId: {
        username,
        schoolId,
      },
    },
    update: {
      role,
      profileId: profile.id, // ensure consistency
    },
    create: {
      username,
      role,
      profileId: profile.id, // ✅ FIXED
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