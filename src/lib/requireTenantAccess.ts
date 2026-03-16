import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { TenantAccess } from "../../types/tenant";

type Role = "admin" | "teacher" | "student";

export async function requireTenantAccess(): Promise<TenantAccess | null> {
  const { userId } = await auth();

  if (!userId) {
    console.log("No Clerk user found");
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { clerk_id: userId },
    select: {
      id: true,
      activeUser: {
        select: {
          id: true,
          role: true,
          schoolId: true,
          school: {
            select: { schoolId: true },
          },
        },
      },
    },
  });

  if (!profile?.activeUser) {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("ROLE:", profile?.activeUser?.role);
  }

  const { activeUser } = profile;
  const baseAccess: TenantAccess = {
    schoolId: activeUser.schoolId,
    schoolSlug: activeUser.school.schoolId,
    role: activeUser.role as Role,
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
      include: {
        enrollments: {
          where: { academicYear: { isActive: true } },
          select: { classId: true },
          take: 1,
        },
      },
    });

    return {
      ...baseAccess,
      studentId: student?.id,
      classId: student?.enrollments?.[0]?.classId,
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
          where: { academicYear: { isActive: true } },
          select: { classId: true },
          take: 1,
        },
      },
    });

    return {
      ...baseAccess,
      classId: teacher?.teacherClassAssignments?.[0]?.classId,
    };
  }

  return baseAccess;
}