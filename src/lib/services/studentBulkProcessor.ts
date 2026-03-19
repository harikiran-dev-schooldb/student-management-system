import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { parseDDMMYYYY } from "@/lib/settings";

export async function processStudentChunk({
  chunk,
  schoolId,
  academicYearId,
  classMap,
  feeMap,
  sessionId,
}: any) {

  const createStudents: any[] = [];
  const updateStudents: any[] = [];
  const enrollmentRows: any[] = [];
  const totalFeeRows: any[] = [];
  const studentFeeRows: any[] = [];
  const identityQueue: any[] = [];

  const identitySet = new Set<string>();

  const admissionNumbers = chunk.map((s: any) => s.admissionNo);

  const existingStudents = await prisma.student.findMany({
    where: {
      schoolId,
      admissionNo: { in: admissionNumbers },
    },
    select: { id: true, admissionNo: true },
  });

  const existingMap = new Map(
    existingStudents.map(s => [s.admissionNo, s.id])
  );

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
    } else {
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
    }

    if (!existingMap.has(admissionNo) && !identitySet.has(username)) {
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

    enrollmentRows.push({
      studentId,
      classId: Number(classId),
      academicYearId,
      schoolId,
    });

    totalFeeRows.push({
      studentId,
      academicYearId,
      schoolId,
    });

    const gradeFees = feeMap.get(gradeId) || [];

    for (const fee of gradeFees) {
      studentFeeRows.push({
        studentId,
        feeStructureId: fee.id,
        academicYearId,
        term: fee.term,
        paidAmount: 0,
        discountAmount: 0,
        fineAmount: 0,
        abacusPaidAmount: 0,
        paymentMode: "CASH",
        schoolId,
      });
    }
  }

  // 🔥 BULK OPS
  if (createStudents.length) {
    await prisma.student.createMany({
      data: createStudents,
      skipDuplicates: true,
    });
  }

  await Promise.all(
    updateStudents.map(u =>
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

  if (totalFeeRows.length) {
    await prisma.studentTotalFees.createMany({
      data: totalFeeRows,
      skipDuplicates: true,
    });
  }

  if (studentFeeRows.length) {
    await prisma.studentFees.createMany({
      data: studentFeeRows,
      skipDuplicates: true,
    });
  }

  if (identityQueue.length) {
    await prisma.identityJob.createMany({
      data: identityQueue,
      skipDuplicates: true,
    });
  }

  // 📊 UPDATE PROGRESS
  await prisma.uploadSession.update({
    where: { id: sessionId },
    data: {
      processed: { increment: chunk.length },
      created: { increment: createStudents.length },
      updated: { increment: updateStudents.length },
    },
  });
}