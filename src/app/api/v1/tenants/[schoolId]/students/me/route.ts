import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   GET → Current Student Profile (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       2️⃣ Authenticate User
    ------------------------------ */
    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "student" || !user.studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       3️⃣ Fetch Student (Tenant Safe)
    ------------------------------ */
    const student = await prisma.student.findFirst({
      where: {
        id: user.studentId,
        schoolId, // 🔒 tenant isolation
      },
      include: {
        Class: {
          include: {
            Teacher: true,
            _count: { select: { lessons: true } },
            Grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       4️⃣ Remove Sensitive Fields
    ------------------------------ */
    /* -----------------------------
   4️⃣ Remove Sensitive Fields
-------------------------------- */
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
  academicYear: student.academicYear,

  class: {
    id: student.Class.id,
    name: student.Class.name,
    gradeId: student.Class.gradeId,
  },
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