import "server-only";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

export interface UserInfo {
  profileId: string | null;
  linkedUserId: string | null;
  role: "admin" | "teacher" | "student" | null;
  schoolId?: string;

  studentId?: string;
  teacherId?: string;
  classId?: number;
  gradeId?: number;
  className?: string | null;
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

async function getStudentInfo(linkedUserId: string) {
  const student = await prisma.student.findUnique({
    where: { linkedUserId },
    select: {
      id: true,
      name: true,
      classId: true,
      Class: {
        select: { gradeId: true },
      },
    },
  });

  if (!student) return null;

  return {
    studentId: student.id,
    classId: student.classId,
    gradeId: student.Class.gradeId,
    name: student.name,
  };
}

async function getTeacherInfo(linkedUserId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { linkedUserId },
    select: {
      id: true,
      class: {
        select: {
          id: true,
          name: true,
          gradeId: true,
        },
      },
    },
  });

  if (!teacher || !teacher.class) return null;

  return {
    teacherId: teacher.id,
    classId: teacher.class.id,
    className: teacher.class.name,
    gradeId: teacher.class.gradeId,
  };
}

/* -------------------------------------------------------
   Main fetchUserInfo (cached)
------------------------------------------------------- */

export async function fetchUserInfo(schoolId: string): Promise<UserInfo> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { profileId: null, linkedUserId: null, role: null };
    }

    /* 1️⃣ Get Profile */
    const profile = await prisma.profile.findUnique({
      where: { clerk_id: clerkId },
      include: {
        activeUser: true,
      },
    });

    if (!profile) {
      return { profileId: null, linkedUserId: null, role: null };
    }

    /* 2️⃣ Validate active user belongs to this school */
    const activeUser = profile.activeUser;

    if (!activeUser || activeUser.schoolId !== schoolId) {
      return {
        profileId: profile.id,
        linkedUserId: null,
        role: null,
      };
    }

    /* ---------------- STUDENT ---------------- */
    if (activeUser.role === "student") {
      const student = await prisma.student.findFirst({
        where: {
          linkedUserId: activeUser.id,
          schoolId,
        },
        select: {
          id: true,
          classId: true,
          Class: { select: { gradeId: true } },
        },
      });

      return {
        profileId: profile.id,
        linkedUserId: activeUser.id,
        role: "student",
        schoolId,
        studentId: student?.id,
        classId: student?.classId,
        gradeId: student?.Class.gradeId,
      };
    }

    /* ---------------- TEACHER ---------------- */
    if (activeUser.role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: {
          linkedUserId: activeUser.id,
          schoolId,
        },
        select: {
          id: true,
          class: {
            select: {
              id: true,
              name: true,
              gradeId: true,
            },
          },
        },
      });

      return {
        profileId: profile.id,
        linkedUserId: activeUser.id,
        role: "teacher",
        schoolId,
        teacherId: teacher?.id,
        classId: teacher?.class?.id,
        className: teacher?.class?.name,
        gradeId: teacher?.class?.gradeId,
      };
    }

    /* ---------------- ADMIN ---------------- */
    return {
      profileId: profile.id,
      linkedUserId: activeUser.id,
      role: "admin",
      schoolId,
    };
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

  if (role === "student") {
    const student = await prisma.student.findFirst({
      where: {
        linkedUserId: userId,
        schoolId,
      },
      select: { classId: true },
    });

    return student?.classId ? [student.classId] : [];
  }

  if (role === "teacher") {
    const teacher = await prisma.teacher.findFirst({
      where: {
        linkedUserId: userId,
        schoolId,
      },
      select: { classId: true },
    });

    return teacher?.classId ? [teacher.classId] : [];
  }

  return [];
}
