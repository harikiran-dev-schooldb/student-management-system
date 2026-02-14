// src/lib/utils/notificationUtils.ts

import prisma from "@/lib/prisma";
import { getMessageContent } from "./messageUtils";
import { MessageType } from "../../../types";

type CreateMessageInput = {
  studentId: string;
  date: string | Date;
  type: MessageType;
  classId: number;
  schoolId: string; // 🔒 REQUIRED
};

export async function createStudentMessage({
  studentId,
  date,
  type,
  classId,
  schoolId,
}: CreateMessageInput) {
  // 🔒 1️⃣ Validate student belongs to this school
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId,
    },
    select: {
      name: true,
      Class: {
        select: {
          name: true,
          Grade: {
            select: { level: true },
          },
        },
      },
    },
  });

  if (!student) return null;

  const className = `Grade ${
    student.Class?.Grade?.level ?? ""
  } - ${student.Class?.name ?? ""}`;

  const message = getMessageContent(type, {
    name: student.name,
    className,
  });

  // 🔒 2️⃣ Create message with schoolId
  return prisma.messages.create({
    data: {
      message,
      type,
      date: new Date(date),
      classId,
      studentId,
      schoolId, // ✅ REQUIRED
    },
  });
}
