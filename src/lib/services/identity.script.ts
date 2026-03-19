import prisma from "../prisma";
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student";
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

  const existing = await clerk.users.getUserList({
    externalId: [normalizedPhone],
  });

  if (existing.data.length > 0) {
    clerkUser = existing.data[0];
    console.log("Reusing Clerk user:", clerkUser.id);
  } else {
    clerkUser = await clerk.users.createUser({
      externalId: normalizedPhone,
      emailAddress: [`${name}@schooldb.com`],
      firstName: name || "User",
      password: crypto.randomUUID(),
      skipPasswordChecks: true,
    });

    console.log("Created Clerk user:", clerkUser.id);
  }

  const clerkId = clerkUser.id;

  const profile = await prisma.profile.upsert({
    where: { phone: normalizedPhone },
    update: { clerk_id: clerkId },
    create: {
      phone: normalizedPhone,
      clerk_id: clerkId,
    },
  });

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

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      activeUserId: linkedUser.id,
    },
  });

  await clerk.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role,
      schoolId,
      username,
      activeRoleId: linkedUser.id,
    },
  });

  return { clerkId };
}