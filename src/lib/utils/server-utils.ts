import "server-only";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { cache } from "react";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */

export interface UserInfo {
  userId: string | null;
  role: "admin" | "teacher" | "student" | null;

  // student
  studentId?: string;
  classId?: number;
  gradeId?: number;
  students?: {
    studentId: string;
    classId: number;
    gradeId: number;
    name: string;
  }[];

  // teacher
  teacherId?: string;
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

export const fetchUserInfo = cache(async (): Promise<UserInfo> => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { userId: null, role: null };

    const profile = await prisma.profile.findUnique({
      where: { clerk_id: clerkId },
      select: {
        activeUser: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    const active = profile?.activeUser;
    if (!active) return { userId: null, role: null };

    /* ---------------- STUDENT ---------------- */
    if (active.role === "student") {
      const student = await getStudentInfo(active.id);
      if (!student) {
        return { userId: active.id, role: "student" };
      }

      return {
        userId: active.id,
        role: "student",
        studentId: student.studentId,
        classId: student.classId,
        gradeId: student.gradeId,
        students: [student],
      };
    }

    /* ---------------- TEACHER ---------------- */
    if (active.role === "teacher") {
      const teacher = await getTeacherInfo(active.id);
      if (!teacher) {
        return { userId: active.id, role: "teacher" };
      }

      return {
        userId: active.id,
        role: "teacher",
        ...teacher,
      };
    }

    /* ---------------- ADMIN ---------------- */
    return {
      userId: active.id,
      role: active.role as "admin",
    };
  } catch (error) {
    console.error("fetchUserInfo error:", error);
    return { userId: null, role: null };
  }
});

export async function getClassIdForRole(
  role: string | null,
  userId: string | null,
): Promise<number[]> {
  if (!userId || !role) return [];

  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { linkedUserId: userId },
      select: { classId: true },
    });
    return student?.classId ? [student.classId] : [];
  }

  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { linkedUserId: userId },
      select: { classId: true },
    });
    return teacher?.classId ? [teacher.classId] : [];
  }

  return [];
}
