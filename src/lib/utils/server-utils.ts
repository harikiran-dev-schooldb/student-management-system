import "server-only";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "../resolveSchool";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

export interface UserInfo {
  userId?: string;
  profileId: string | null;
  linkedUserId: string | null;
  role: "admin" | "teacher" | "student" | null;
  schoolId?: string;

  studentId?: string;
  teacherId?: string;

  classId?: number;
  gradeId?: number;
  branchId?: number;
  branchName?: string;
  branchType?: string;

  className?: string | null;
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

async function getStudentInfo(linkedUserId: string) {
  const student = await prisma.student.findUnique({
    where: { linkedUserId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          class: {
            include: {
              Grade: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) return null;

  const enrollment = student.enrollments[0];

  return {
    studentId: student.id,
    classId: enrollment?.class.id ?? null,
    gradeId: enrollment?.class.gradeId ?? null,
    name: student.name,
  };
}

async function getTeacherInfo(linkedUserId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { linkedUserId },
    select: {
      id: true,
      teacherClassAssignments: {
        where: {
          academicYear: { isActive: true },
        },
        select: {
          class: {
            select: {
              id: true,
              name: true,
              gradeId: true,
            },
          },
        },
      },
    },
  });

  const assignment = teacher?.teacherClassAssignments?.[0];

  if (!teacher || !assignment?.class) return null;

  return {
    teacherId: teacher.id,
    classId: assignment.class.id,
    className: assignment.class.name,
    gradeId: assignment.class.gradeId,
  };
}

/* -------------------------------------------------------
   Main fetchUserInfo (cached)
------------------------------------------------------- */

export async function fetchUserInfo(schoolSlug: string): Promise<UserInfo> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { profileId: null, linkedUserId: null, role: null };
    }

    // 1️⃣ Resolve school slug → internal ID
    const resolvedSchoolId = await resolveSchoolId(schoolSlug);
    if (!resolvedSchoolId) {
      return { profileId: null, linkedUserId: null, role: null };
    }

    // 2️⃣ Fetch profile + active linked user
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: clerkId },
      include: { activeUser: true },
    });

    if (!profile || !profile.activeUser) {
      return { profileId: null, linkedUserId: null, role: null };
    }

    const activeUser = profile.activeUser;

    // 3️⃣ Validate school match
    if (activeUser.schoolId !== resolvedSchoolId) {
      return {
        profileId: profile.id,
        linkedUserId: null,
        role: null,
      };
    }

    /* ---------------- STUDENT ---------------- */
    if (activeUser.role === "student") {
      const student = await prisma.student.findUnique({
        where: { linkedUserId: activeUser.id },
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  Grade: {
                    include: {
                      branch: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const enrollment = student?.enrollments?.[0];
      const branch = enrollment?.class?.Grade?.branch;

      return {
        profileId: profile.id,
        userId: activeUser.id,
        linkedUserId: activeUser.id,
        role: "student",
        schoolId: resolvedSchoolId,
        studentId: student?.id,
        classId: enrollment?.class.id,
        gradeId: enrollment?.class.gradeId,
        className: enrollment?.class.name ?? null,
        branchId: branch?.id,
        branchName: branch?.name,
        branchType: branch?.type,
      };
    }

    /* ---------------- TEACHER ---------------- */
    /* ---------------- TEACHER ---------------- */
    if (activeUser.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { linkedUserId: activeUser.id },
        include: {
          teacherClassAssignments: {
            where: {
              academicYear: { isActive: true },
            },
            include: {
              class: {
                include: {
                  Grade: {
                    include: {
                      branch: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const assignment = teacher?.teacherClassAssignments?.[0];
      const branch = assignment?.class?.Grade?.branch;

      return {
        profileId: profile.id,
        userId: activeUser.id,
        linkedUserId: activeUser.id,
        role: "teacher",
        schoolId: resolvedSchoolId,

        teacherId: teacher?.id,

        classId: assignment?.class?.id,
        className: assignment?.class?.name,
        gradeId: assignment?.class?.gradeId,

        branchId: branch?.id,
        branchName: branch?.name,
        branchType: branch?.type,
      };
    }

    /* ---------------- ADMIN ---------------- */
    if (activeUser.role === "admin") {
      return {
        profileId: profile.id,
        userId: activeUser.id,
        linkedUserId: activeUser.id,
        role: "admin",
        schoolId: resolvedSchoolId,
      };
    }

    return { profileId: null, linkedUserId: null, role: null };
  } catch (error) {
    console.error("fetchUserInfo error:", error);
    return { profileId: null, linkedUserId: null, role: null };
  }
}

export async function getClassIdForRole(
  role: string | null,
  userId: string | null,
  schoolId: string,
): Promise<number[]> {
  if (!userId || !role) return [];

  /* ---------------- STUDENT ---------------- */
  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { linkedUserId: userId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          select: { classId: true },
        },
      },
    });

    return student?.enrollments?.length
      ? student.enrollments.map((e) => e.classId)
      : [];
  }

  /* ---------------- TEACHER ---------------- */
  /* ---------------- TEACHER ---------------- */
  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { linkedUserId: userId },
      include: {
        teacherClassAssignments: {
          where: {
            academicYear: { isActive: true },
            schoolId,
          },
          select: { classId: true },
        },
      },
    });

    return teacher?.teacherClassAssignments?.length
      ? teacher.teacherClassAssignments.map((a) => a.classId)
      : [];
  }
  return [];
}
