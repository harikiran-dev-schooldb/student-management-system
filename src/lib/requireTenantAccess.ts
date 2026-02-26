import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { TenantAccess } from "../../types/tenant";



export async function requireTenantAccess(): Promise<TenantAccess> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const profile = await prisma.profile.findUnique({
    where: { clerk_id: userId },
    include: {
      activeUser: {
        include: { school: true },
      },
    },
  });

  if (!profile?.activeUser) {
    throw new Error("No active school selected");
  }

  const { activeUser } = profile;

  const baseAccess = {
    schoolId: activeUser.schoolId,
    schoolSlug: activeUser.school.schoolId,
    role: activeUser.role as "admin" | "teacher" | "student",
    userId,
    profileId: profile.id,
  };

  /* ---------------- STUDENT ---------------- */
  if (activeUser.role === "student") {
    const student = await prisma.student.findFirst({
      where: {
        linkedUserId: activeUser.id,
        schoolId: activeUser.schoolId,
      },
      select: {
        id: true,
        classId: true,
      },
    });

    return {
      ...baseAccess,
      studentId: student?.id,
      classId: student?.classId ?? undefined,
    };
  }

  /* ---------------- TEACHER ---------------- */
  if (activeUser.role === "teacher") {
    const teacher = await prisma.teacher.findFirst({
      where: {
        linkedUserId: activeUser.id,
        schoolId: activeUser.schoolId,
      },
      select: { classId: true },
    });

    return {
      ...baseAccess,
      classId: teacher?.classId ?? undefined,
    };
  }

  /* ---------------- ADMIN ---------------- */
  return baseAccess;
}