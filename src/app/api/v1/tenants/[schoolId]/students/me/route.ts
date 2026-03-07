export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

/* ======================================================
   GET → Current Student Profile (Tenant Safe)
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {

    /* 1️⃣ Resolve tenant */

    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* 2️⃣ Auth */

    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "student" || !user.studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 3️⃣ Fetch student */

    const student = await prisma.student.findFirst({
      where: {
        id: user.studentId,
        schoolId,
      },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              include: {
                Grade: {
                  select: {
                    id: true,
                    level: true,
                  },
                },
                teacherClassAssignments: {
                  include: {
                    teacher: {
                      select: {
                        id: true,
                        name: true,
                        phone: true,
                      },
                    },
                  },
                },
                _count: {
                  select: { lessons: true },
                },
              },
            },
            academicYear: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const enrollment = student.enrollments[0];

    /* 4️⃣ Sanitized response */

    const sanitized = {
      id: student.id,
      username: student.username,
      name: student.name,
      motherName: student.motherName,
      fatherName: student.fatherName,
      email: student.email,
      phone: student.phone,
      address: student.address,
      img: student.img,
      bloodType: student.bloodType,
      gender: student.gender,
      dob: student.dob,

      academicYear: enrollment?.academicYear?.name ?? null,

      class: enrollment
        ? {
            id: enrollment.class.id,
            name: enrollment.class.name,
            section: enrollment.class.section,
            grade: enrollment.class.Grade,
            teacher:
              enrollment.class.teacherClassAssignments[0]?.teacher ?? null,
            lessonCount: enrollment.class._count.lessons,
          }
        : null,
    };

    return NextResponse.json(sanitized, { status: 200 });

  } catch (err) {
    console.error("Student profile error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}