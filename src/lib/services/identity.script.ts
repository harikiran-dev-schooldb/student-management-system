import prisma from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student" | "teacher" | "admin" | "principal" | "superadmin";
  schoolId: string;
};

export async function createOrUpdateIdentityScript({
  username,
  phone,
  name,
  role,
  schoolId,
}: IdentityInput) {

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  let clerkUser;

  // 🔍 Find existing Clerk user
  const existing = await clerk.users.getUserList({
    externalId: [normalizedPhone],
  });

  if (existing.data.length > 0) {
    clerkUser = existing.data[0];
    console.log("Reusing Clerk:", clerkUser.id);
  } else {
    clerkUser = await clerk.users.createUser({
      externalId: normalizedPhone,
      emailAddress: [`${normalizedPhone}@schooldb.com`],
      firstName: name || "User",
      password: crypto.randomUUID(),
      skipPasswordChecks: true,
    });

    console.log("Created Clerk:", clerkUser.id);
  }

  const clerkId = clerkUser.id;

  // ✅ Profile
  const profile = await prisma.profile.upsert({
    where: { phone: normalizedPhone },
    update: { clerk_id: clerkId },
    create: {
      phone: normalizedPhone,
      clerk_id: clerkId,
    },
  });

  // ✅ Linked User
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

  // ✅ Active role
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      activeUserId: linkedUser.id,
    },
  });

  // ✅ Metadata
  await clerk.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role,
      schoolId,
      username,
      activeRoleId: linkedUser.id,
    },
  });

  return {
    clerkId,
    profileId: profile.id,
    linkedUserId: linkedUser.id,
  };
}