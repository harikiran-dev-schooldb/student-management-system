import "server-only";
import prisma from "../prisma";

type UserIdentifiers = {
  classId: number | null;
  studentId: string | null;
};

export const getUserIdentifiersForRole = async (
  role: string | null,
  userId: string | null
): Promise<UserIdentifiers> => {
  if (!userId) {
    return { classId: null, studentId: null };
  }

  if (role === "student") {
    const clerkStudent = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      select: {
        student: { select: { classId: true, id: true } },
      },
    });

    const firstStudent = clerkStudent?.student[0] ?? null;

    return {
      classId: firstStudent?.classId ?? null,
      studentId: firstStudent?.id ?? null,
    };
  }

  if (role === "teacher") {
    const clerkTeacher = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      select: {
        teacher: { select: { classId: true, id: true } },
      },
    });

    const firstTeacher = clerkTeacher?.teacher[0] ?? null;

    return {
      classId: firstTeacher?.classId ?? null,
      studentId: null,
    };
  }

  // ✅ default for all other roles
  return { classId: null, studentId: null };
};
