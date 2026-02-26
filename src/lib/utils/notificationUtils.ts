// src/lib/utils/notificationUtils.ts

import prisma from "@/lib/prisma";
import { getMessageContent } from "./messageUtils";
import { MessageType } from "../../../types";

type CreateMessageInput = {
  studentId: string;
  date: string | Date;
  type: MessageType;
  classId?: number;
  schoolId: string;
};

export async function createStudentMessage(
  input: CreateMessageInput,
  tx?: typeof prisma
) {
  const db = tx ?? prisma;

  const { studentId, date, type, classId, schoolId } = input;

  /* 🔒 1️⃣ Validate student belongs to tenant */
  const student = await db.student.findFirst({
    where: {
      id: studentId,
      schoolId,
    },
    select: {
      name: true,
      classId: true,
      Class: {
        select: {
          name: true,
          Grade: { select: { level: true } },
        },
      },
    },
  });

  if (!student) return null;

  /* 🔒 2️⃣ Fetch school name */
  const school = await db.schoolInfo.findUnique({
    where: { id: schoolId },
    select: { name: true },
  });

  if (!school) return null;

  const className = student.Class
    ? `Grade ${student.Class.Grade?.level ?? ""} - ${student.Class.name}`
    : undefined;

  const message = getMessageContent(type, {
    studentName: student.name,
    className,
    schoolName: school.name,
    date: new Date(date),
  });

  /* 🔒 3️⃣ Create message */
  return db.messages.create({
    data: {
      message,
      type,
      date: new Date(date),
      studentId,
      classId: classId ?? student.classId ?? undefined,
      schoolId,
    },
  });
}