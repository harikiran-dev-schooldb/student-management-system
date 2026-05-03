// FILE: /lib/services/student.service.ts

import prisma from "@/lib/prisma";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";

export async function createStudentWithIdentity(
  data: any,
  schoolId: string
) {
  const admissionNo = data.admissionNo?.trim();
  if (!admissionNo) throw new Error("Admission number is required");

  const username = `s${admissionNo}`;

  const existing = await prisma.student.findFirst({
    where: { admissionNo, schoolId },
  });

  if (existing) throw new Error("Admission number already exists");

  const classData = await prisma.class.findFirst({
    where: { id: data.classId, schoolId },
    select: { gradeId: true },
  });

  if (!classData) throw new Error("Invalid class");

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
  });

  if (!academicYear) throw new Error("No active academic year");

  if (!data.dob) throw new Error("DOB is required");

  const dob = new Date(data.dob);
  if (isNaN(dob.getTime())) throw new Error("Invalid DOB format");

  const normalize = (val?: string | null) =>
    val && val.trim() !== "" ? val : null;

  // ⚠️ Create identity FIRST (cannot be inside DB tx)
  const identity = await createOrUpdateIdentity({
    username,
    phone: data.phone,
    name: data.name,
    role: "student",
    schoolId,
  });

  try {
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          admissionNo,
          username,
          name: data.name,
          fatherName: normalize(data.fatherName),
          motherName: normalize(data.motherName),
          email: normalize(data.email),
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          clerk_id: identity.clerkId,
          profileId: identity.profileId,
          linkedUserId: identity.linkedUserId,
          schoolId,
          dob,
        },
      });

      await tx.studentEnrollment.create({
        data: {
          studentId: newStudent.id,
          classId: data.classId,
          academicYearId: academicYear.id,
          schoolId,
        },
      });

      const feeStructures = await tx.feeStructure.findMany({
        where: {
          gradeId: classData.gradeId,
          academicYearId: academicYear.id,
          schoolId,
        },
      });

      if (feeStructures.length > 0) {
  await tx.studentFees.createMany({
    data: feeStructures.map((f) => ({
      studentId: newStudent.id,
      feeStructureId: f.id,
      feeCycleId: f.feeCycleId, // ✅ use relation
      academicYearId: academicYear.id,

      paidAmount: 0,
      discountAmount: 0,
      fineAmount: 0,

      dueAmount: f.amount ?? 0, // ✅ CRITICAL

      paymentMode: "CASH",
      schoolId,
    })),
    skipDuplicates: true, // ✅ prevent duplicates
  });
}

      // ✅ ADD THIS (you missed)
      await tx.studentTotalFees.create({
        data: {
          studentId: newStudent.id,
          academicYearId: academicYear.id,
          schoolId,
        },
      });

      return newStudent;
    });

    return student;

  } catch (error) {
    // 🚨 VERY IMPORTANT: rollback Clerk if DB fails
    console.error("DB failed after Clerk created:", error);

    // OPTIONAL: delete Clerk user if needed
    // await deleteIdentity(identity.clerkId);

    throw error;
  }
}

export async function bulkCreateStudents(students: any[], schoolId: string) {
  const results: any[] = [];
  const errors: any[] = [];

  for (let i = 0; i < students.length; i++) {
    try {
      const student = await createStudentWithIdentity(students[i], schoolId);
      results.push(student);
    } catch (err: any) {
      errors.push({ row: i + 1, error: err.message });
    }
  }

  return {
    success: results.length,
    failed: errors.length,
    errors,
  };
}