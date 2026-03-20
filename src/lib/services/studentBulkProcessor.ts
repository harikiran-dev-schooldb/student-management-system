import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { parseDDMMYYYY } from "@/lib/settings";
import { assignFeesToStudent } from "@/lib/services/fee.service";

export async function processStudentChunk({
  chunk,
  schoolId,
  academicYearId,
  classMap,
  sessionId,
}: any) {
  const createStudents: any[] = [];
  const updateStudents: any[] = [];
  const enrollmentRows: any[] = [];
  const identityQueue: any[] = [];

  const identitySet = new Set<string>();

  const admissionNumbers = chunk.map((s: any) => s.admissionNo);

  /* -------------------------------------------------------
     1️⃣ Find Existing Students
  ------------------------------------------------------- */
  const existingStudents = await prisma.student.findMany({
    where: {
      schoolId,
      admissionNo: { in: admissionNumbers },
    },
    select: { id: true, admissionNo: true },
  });

  const existingMap = new Map(
    existingStudents.map((s) => [s.admissionNo, s.id])
  );

  /* -------------------------------------------------------
     2️⃣ Prepare Data
  ------------------------------------------------------- */
  for (const s of chunk) {
    const {
      admissionNo,
      name,
      phone,
      address,
      gender,
      dob,
      classId,
      fatherName,
      motherName,
      email,
    } = s;

    if (!admissionNo || !name || !phone || !dob || !classId) continue;

    const parsedDob = parseDDMMYYYY(dob);
    if (!parsedDob) continue;

    const gradeId = classMap.get(Number(classId));
    if (!gradeId) continue;

    const username = `s${admissionNo}`;
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

    let studentId = existingMap.get(admissionNo);

    /* ---- UPDATE ---- */
    if (studentId) {
      updateStudents.push({
        id: studentId,
        data: {
          name,
          phone: normalizedPhone,
          address,
          fatherName,
          motherName,
          email,
          gender,
          dob: parsedDob,
        },
      });
    }

    /* ---- CREATE ---- */
    else {
      studentId = randomUUID();

      createStudents.push({
        id: studentId,
        admissionNo,
        username,
        name,
        phone: normalizedPhone,
        address,
        gender,
        dob: parsedDob,
        fatherName,
        motherName,
        email,
        schoolId,
      });

      if (!identitySet.has(username)) {
        identitySet.add(username);

        identityQueue.push({
          username,
          phone: normalizedPhone,
          name,
          role: "student",
          schoolId,
          status: "pending",
          attempts: 0,
        });
      }
    }

    /* ---- Enrollment ---- */
    enrollmentRows.push({
      studentId,
      classId: Number(classId),
      academicYearId,
      schoolId,
    });
  }

  /* -------------------------------------------------------
     3️⃣ Bulk DB Operations
  ------------------------------------------------------- */

  if (createStudents.length) {
    await prisma.student.createMany({
      data: createStudents,
      skipDuplicates: true,
    });
  }

  await Promise.all(
    updateStudents.map((u) =>
      prisma.student.update({
        where: { id: u.id },
        data: u.data,
      })
    )
  );

  if (enrollmentRows.length) {
    await prisma.studentEnrollment.createMany({
      data: enrollmentRows,
      skipDuplicates: true,
    });
  }

  if (identityQueue.length) {
    await prisma.identityJob.createMany({
      data: identityQueue,
      skipDuplicates: true,
    });
  }

  /* -------------------------------------------------------
     4️⃣ Assign Fees (IMPORTANT 🔥)
  ------------------------------------------------------- */

  const students = await prisma.student.findMany({
    where: {
      schoolId,
      admissionNo: { in: admissionNumbers },
    },
    select: {
      id: true,
      enrollments: {
        where: { academicYearId },
        include: { class: true },
      },
    },
  });

  for (const student of students) {
    const enrollment = student.enrollments[0];
    if (!enrollment) continue;

    await assignFeesToStudent(prisma, {
      studentId: student.id,
      gradeId: enrollment.class.gradeId,
      academicYearId,
      schoolId,
    });
  }

  /* -------------------------------------------------------
     5️⃣ Update Progress
  ------------------------------------------------------- */

  await prisma.uploadSession.update({
    where: { id: sessionId },
    data: {
      processed: { increment: chunk.length },
      created: { increment: createStudents.length },
      updated: { increment: updateStudents.length },
    },
  });
}