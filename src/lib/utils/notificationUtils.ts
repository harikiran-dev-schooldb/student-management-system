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

  /* 🔒 1️⃣ Validate student + get enrollment */
  const student = await db.student.findFirst({
    where: {
      id: studentId,
      schoolId,
    },
    select: {
      id: true,
      name: true,
      enrollments: {
        where: { status: "ACTIVE" },
        select: {
          classId: true,
          class: {
            select: {
              name: true,
              section: true,
              Grade: {
                select: {
                  level: true,
                },
              },
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!student) return null;

  const enrollment = student.enrollments[0];

  /* 🔒 2️⃣ Fetch school name */
  const school = await db.schoolInfo.findUnique({
    where: { id: schoolId },
    select: { name: true },
  });

  if (!school) return null;

  const className = enrollment
    ? `Grade ${enrollment.class.Grade.level} - ${enrollment.class.section}`
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
      classId: classId ?? enrollment?.classId ?? undefined,
      schoolId,
    },
  });
}
