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
  /* ---------------- STUDENT ---------------- */
  if (activeUser.role === "student") {
    const student = await prisma.student.findFirst({
      where: {
        linkedUserId: activeUser.id,
        schoolId: activeUser.schoolId,
      },
      include: {
        enrollments: {
          where: {
            academicYear: { isActive: true },
          },
          select: { classId: true },
          take: 1,
        },
      },
    });

    return {
      ...baseAccess,
      studentId: student?.id,
      classId: student?.enrollments[0]?.classId,
    };
  }

  /* ---------------- TEACHER ---------------- */
  if (activeUser.role === "teacher") {
    const teacher = await prisma.teacher.findFirst({
      where: {
        linkedUserId: activeUser.id,
        schoolId: activeUser.schoolId,
      },
      include: {
        teacherClassAssignments: {
          where: {
            academicYear: { isActive: true },
          },
          select: { classId: true },
          take: 1,
        },
      },
    });

    return {
      ...baseAccess,
      classId: teacher?.teacherClassAssignments[0].classId ?? undefined,
    };
  }

  /* ---------------- ADMIN ---------------- */
  return baseAccess;
}