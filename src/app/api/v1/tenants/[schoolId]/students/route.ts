import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { StudentStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {

    const { schoolId: schoolSlug } = await params;
    const user = await fetchUserInfo(schoolSlug);

    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = user.schoolId;

    const { searchParams } = new URL(req.url);

    const classId = searchParams.get("classId");
    const gradeId = searchParams.get("gradeId");
    const gender = searchParams.get("gender");
    const search = searchParams.get("search");

    /* 3️⃣ Base Filter */

    const where: any = {
      schoolId,
      status: StudentStatus.ACTIVE,
    };

    /* 4️⃣ Role Based Filtering */

    if (user.role === "student") {
      where.id = user.studentId;
    }

    if (user.role === "teacher") {

      if (!user.classId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      where.enrollments = {
        some: {
          classId: user.classId,
          status: "ACTIVE",
        },
      };
    }

    if (user.role === "admin") {

      if (classId) {
        where.enrollments = {
          some: {
            classId: Number(classId),
          },
        };
      }

      if (gradeId) {
        where.enrollments = {
          some: {
            class: {
              gradeId: Number(gradeId),
            },
          },
        };
      }
    }

    /* 5️⃣ Optional Filters */

    if (gender) {
      where.gender = gender;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    /* 6️⃣ Query */

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              include: {
                Grade: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = students.map((s) => ({
      id: s.id,
      name: s.name,
      classId: s.enrollments?.[0]?.class?.id ?? null,
      className: s.enrollments?.[0]?.class?.name ?? null,
      section: s.enrollments?.[0]?.class?.section ?? null,
      grade: s.enrollments?.[0]?.class?.Grade?.level ?? null,
    }));

    return NextResponse.json(result);

  } catch (error: any) {

    console.error("Error fetching students:", error);

    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}