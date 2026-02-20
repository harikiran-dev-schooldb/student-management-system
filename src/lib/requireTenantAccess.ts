import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export type TenantAccess = {
  schoolId: string;      // Internal DB ID
  schoolSlug: string;    // URL slug
  role: string;
  userId: string;
  profileId: string;
};

export async function requireTenantAccess(): Promise<TenantAccess> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.profile.findUnique({
    where: { clerk_id: userId },
    include: {
      activeUser: {
        include: {
          school: true,
        },
      },
    },
  });

  if (!profile?.activeUser) {
    throw new Error("No active school selected");
  }

  return {
    schoolId: profile.activeUser.schoolId,
    schoolSlug: profile.activeUser.school.schoolId,
    role: profile.activeUser.role,
    userId,
    profileId: profile.id,
  };
}
