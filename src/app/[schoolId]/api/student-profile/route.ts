import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function GET() {
  try {
    const { userId, role, students } = await fetchUserInfo();

    if (!userId || !role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let student = null;

    if (role === "student") {
      // get first student from fetchUserInfo (already filtered by Clerk userId)
      const studentInfo = students?.[0];
      if (!studentInfo) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      // fetch full student record with relations
      student = await prisma.student.findUnique({
        where: { id: studentInfo.studentId },
        include: {
          Class: {
            include: {
              Teacher: true,
              _count: { select: { lessons: true } },
              Grade: { include: { feestructure: true } },
            },
          },
          profile: true,
          linkedUser: true,
        },
      });
    }

    // (optional) if you want teachers/admins to also get profile data
    if (role === "teacher" || role === "admin") {
      // handle teacher/admin case if needed
    }

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
