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

  /* ---------------- STUDENT ---------------- */

  if (role === "student") {
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      select: {
        student: {
          select: {
            id: true,
            enrollments: {
              where: { status: "ACTIVE" },
              select: {
                classId: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const student = profile?.student?.[0];

    return {
      classId: student?.enrollments?.[0]?.classId ?? null,
      studentId: student?.id ?? null,
    };
  }

  /* ---------------- TEACHER ---------------- */

  if (role === "teacher") {
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: userId },
      select: {
        teacher: {
          select: {
            teacherClassAssignments: {
              select: {
                classId: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const teacher = profile?.teacher?.[0];

    return {
      classId: teacher?.teacherClassAssignments?.[0]?.classId ?? null,
      studentId: null,
    };
  }

  /* ---------------- DEFAULT ---------------- */

  return { classId: null, studentId: null };
};
