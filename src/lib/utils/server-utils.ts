// src/lib/server-utils.ts
import "server-only";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { cache } from "react";

interface UserInfo {
  userId: string | null;
  role: string | null;
  students?: { studentId: string; classId: number; name: string }[];
  teacherId?: string;
  classId?: number;
  studentId?: string;
}

async function getStudentInfo(linkedUserId: string) {
  const student = await prisma.student.findUnique({
    where: { linkedUserId },
    select: { id: true, classId: true, name: true },
  });

  if (!student) return [];
  return [
    { studentId: student.id, classId: student.classId, name: student.name },
  ];
}

async function getTeacherInfo(linkedUserId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { linkedUserId },
    select: { id: true },
  });

  if (!teacher) return {};

  const teacherClass = await prisma.class.findUnique({
    where: { supervisorId: teacher.id },
    select: { id: true, name: true },
  });

  return {
    teacherId: teacher.id,
    classId: teacherClass?.id,
    className: teacherClass?.name,
  };
}

export const fetchUserInfo = cache(async (): Promise<UserInfo> => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { userId: null, role: null };

    const profile = await prisma.profile.findUnique({
      where: { clerk_id: clerkId },
      select: { activeUser: { select: { id: true, role: true } } },
    });

    const active = profile?.activeUser;
    if (!active) return { userId: null, role: null };

    if (active.role === "student") {
      const students = await getStudentInfo(active.id);
      if (!students || students.length === 0) {
        return { userId: active.id, role: "student" };
      }

      const primaryStudent = students[0];
      return {
        userId: active.id,
        role: "student",
        studentId: primaryStudent.studentId,
        classId: primaryStudent.classId,
        students,
      };
    }

    if (active.role === "teacher") {
      const teacherInfo = await getTeacherInfo(active.id);
      return { userId: active.id, role: "teacher", ...teacherInfo };
    }

    // ✅ Admin or others
    return { userId: active.id, role: active.role };
  } catch (error) {
    console.error("fetchUserInfo error:", error);
    return { userId: null, role: null };
  }
});

export async function getClassIdForRole(
  role: string | null,
  userId: string | null
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
