export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { randomUUID } from "crypto";
import { parseDDMMYYYY } from "@/lib/settings";


/* -----------------------------
   Bulk Student Upload
--------------------------------*/
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { students } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    /* -----------------------------
       Active Academic Year
    --------------------------------*/
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    /* -----------------------------
       Load Classes
    --------------------------------*/
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, gradeId: true },
    });

    const classMap = new Map(classes.map((c) => [c.id, c.gradeId]));

    /* -----------------------------
       Load Fee Structures
    --------------------------------*/
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId,
        academicYearId: academicYear.id,
      },
    });

    const feeMap = new Map<number, typeof feeStructures>();

    for (const fee of feeStructures) {
      if (!feeMap.has(fee.gradeId)) feeMap.set(fee.gradeId, []);
      feeMap.get(fee.gradeId)!.push(fee);
    }

    /* -----------------------------
       Fetch existing students
    --------------------------------*/
    const admissionNumbers = students.map((s: any) => s.admissionNo);

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

    /* -----------------------------
       Prepare rows
    --------------------------------*/
    const createStudents: any[] = [];
    const updateStudents: any[] = [];

    const enrollmentRows: any[] = [];
    const totalFeeRows: any[] = [];
    const studentFeeRows: any[] = [];

    const errors: string[] = [];

    const identitySet = new Set<string>();

    const identityQueue: {
      username: string;
      phone: string;
      name: string;
      role: "student";
      schoolId: string;
    }[] = [];

    /* -----------------------------
       Process students
    --------------------------------*/
    for (const s of students) {
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

      if (!admissionNo || !name || !phone || !dob || !classId) {
        errors.push(`Missing fields for ${admissionNo}`);
        continue;
      }

      const parsedDob = parseDDMMYYYY(dob);
      if (!parsedDob) {
        errors.push(`Invalid DOB for ${admissionNo}`);
        continue;
      }

      const gradeId = classMap.get(Number(classId));
      if (!gradeId) {
        errors.push(`Invalid class for ${admissionNo}`);
        continue;
      }

      let studentId = existingMap.get(admissionNo);

      /* -----------------------------
         UPDATE student
      --------------------------------*/
      const username = `s${admissionNo}`;
      if (studentId) {
        updateStudents.push({
          id: studentId,
          data: {
            name,
            phone,
            address,
            fatherName,
            motherName,
            email,
            gender,
            dob: parsedDob,
          },
        });
      }

      /* -----------------------------
         CREATE student
      --------------------------------*/
      else {
        studentId = randomUUID();

        createStudents.push({
          id: studentId,
          admissionNo,
          username: `s${admissionNo}`,
          name,
          phone,
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
          phone,
          name,
          role: "student",
          schoolId,
        });
      }

      /* -----------------------------
         Enrollment
      --------------------------------*/
      enrollmentRows.push({
        studentId,
        classId: Number(classId),
        academicYearId: academicYear.id,
        schoolId,
      });

      /* -----------------------------
         Total Fees
      --------------------------------*/
      totalFeeRows.push({
        studentId,
        academicYearId: academicYear.id,
        schoolId,
      });

      /* -----------------------------
         Student Fees
      --------------------------------*/
      const gradeFees = feeMap.get(gradeId) || [];

      for (const fee of gradeFees) {
        studentFeeRows.push({
          studentId,
          feeStructureId: fee.id,
          academicYearId: academicYear.id,
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

    /* -----------------------------
       Transaction
    --------------------------------*/
    await prisma.$transaction(async (tx) => {

      if (createStudents.length) {
        await tx.student.createMany({
          data: createStudents,
        });
      }

      for (const u of updateStudents) {
        await tx.student.update({
          where: { id: u.id },
          data: u.data,
        });
      }

      if (enrollmentRows.length) {
        await tx.studentEnrollment.createMany({
          data: enrollmentRows,
          skipDuplicates: true,
        });
      }

      if (totalFeeRows.length) {
        await tx.studentTotalFees.createMany({
          data: totalFeeRows,
          skipDuplicates: true,
        });
      }

      if (studentFeeRows.length) {
        await tx.studentFees.createMany({
          data: studentFeeRows,
          skipDuplicates: true,
        });
      }
    });

    /* -----------------------------
   Create Identity Jobs (Background)
--------------------------------*/

    const batchSize = 50;

    for (let i = 0; i < identityQueue.length; i += batchSize) {
      const batch = identityQueue.slice(i, i + batchSize);

      await prisma.identityJob.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: "Upload completed",
      created: createStudents.length,
      updated: updateStudents.length,
      errors,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}