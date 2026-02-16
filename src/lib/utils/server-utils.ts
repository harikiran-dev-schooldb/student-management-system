import "server-only";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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

export async function fetchUserInfo(
  schoolId: string
): Promise<UserInfo> {

    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) return { userId: null, role: null };

      // 1️⃣ Find profile by Clerk ID
      const profile = await prisma.profile.findUnique({
        where: { clerk_id: clerkId },
        select: { id: true },
      });

      if (!profile) return { userId: null, role: null };

      // 2️⃣ Find active linked user FOR THIS SCHOOL
      const linkedUser = await prisma.linkedUser.findFirst({
        where: {
          profileId: profile.id,
          schoolId, // 🔒 TENANT FILTER
        },
        select: {
          id: true,
          role: true,
        },
      });

      if (!linkedUser) {
        return { userId: null, role: null };
      }

      /* ---------------- STUDENT ---------------- */
      if (linkedUser.role === "student") {
        const student = await prisma.student.findFirst({
          where: {
            linkedUserId: linkedUser.id,
            schoolId, // 🔒 TENANT FILTER
          },
          select: {
            id: true,
            name: true,
            classId: true,
            Class: { select: { gradeId: true } },
          },
        });

        if (!student) {
          return { userId: linkedUser.id, role: "student" };
        }

        return {
          userId: linkedUser.id,
          role: "student",
          studentId: student.id,
          classId: student.classId,
          gradeId: student.Class.gradeId,
          students: [
            {
              studentId: student.id,
              classId: student.classId,
              gradeId: student.Class.gradeId,
              name: student.name,
            },
          ],
        };
      }

      /* ---------------- TEACHER ---------------- */
      if (linkedUser.role === "teacher") {
        const teacher = await prisma.teacher.findFirst({
          where: {
            linkedUserId: linkedUser.id,
            schoolId, // 🔒 TENANT FILTER
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

        if (!teacher || !teacher.class) {
          return { userId: linkedUser.id, role: "teacher" };
        }

        return {
          userId: linkedUser.id,
          role: "teacher",
          teacherId: teacher.id,
          classId: teacher.class.id,
          className: teacher.class.name,
          gradeId: teacher.class.gradeId,
        };
      }

      /* ---------------- ADMIN ---------------- */
      return {
        userId: linkedUser.id,
        role: "admin",
      };
    } catch (error) {
      console.error("fetchUserInfo error:", error);
      return { userId: null, role: null };
    }
  }

export async function getClassIdForRole(
  role: string | null,
  userId: string | null,
  schoolId: string
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

