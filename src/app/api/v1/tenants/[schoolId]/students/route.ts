import {
  NextRequest,
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import { fetchUserInfo } from "@/lib/utils/server-utils";

import {
  StudentStatus,
  Gender,
  Prisma,
} from "@prisma/client";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      schoolId: string;
    }>;
  }
) {
  try {
    /* -----------------------------------
       AUTH
    ----------------------------------- */

    const {
      schoolId: schoolSlug,
    } = await params;

    const user =
      await fetchUserInfo(
        schoolSlug
      );

    if (!user) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const schoolId =
      user.schoolId;

    /* -----------------------------------
       QUERY PARAMS
    ----------------------------------- */

    const { searchParams } =
      new URL(req.url);

    const classId =
      searchParams.get(
        "classId"
      );

    const gradeId =
      searchParams.get(
        "gradeId"
      );

    const branchId =
      searchParams.get(
        "branchId"
      );

    const gender =
      searchParams.get(
        "gender"
      );

    const search =
      searchParams.get(
        "search"
      );

    /* -----------------------------------
       BASE WHERE
    ----------------------------------- */

    const where: Prisma.StudentWhereInput =
      {
        schoolId,

        status:
          StudentStatus.ACTIVE,
      };

    /* -----------------------------------
       STUDENT ACCESS
    ----------------------------------- */

    if (
      user.role === "student"
    ) {
      where.id =
        user.studentId;
    }

    /* -----------------------------------
       ENROLLMENT FILTER
    ----------------------------------- */

    const enrollmentFilter: any =
      {
        status: "ACTIVE",
      };

    /* -----------------------------------
       TEACHER ACCESS
    ----------------------------------- */

    if (
      user.role === "teacher"
    ) {
      if (!user.classId) {
        return NextResponse.json(
          {
            error:
              "Unauthorized",
          },
          {
            status: 401,
          }
        );
      }

      enrollmentFilter.classId =
        user.classId;
    }

    /* -----------------------------------
       CLASS FILTER
    ----------------------------------- */

    if (classId) {
      enrollmentFilter.classId =
        Number(classId);
    }

    /* -----------------------------------
       GRADE / BRANCH FILTER
    ----------------------------------- */

    if (
      gradeId ||
      branchId
    ) {
      enrollmentFilter.class =
        {};

      if (gradeId) {
        enrollmentFilter.class.gradeId =
          Number(gradeId);
      }

      if (branchId) {
        enrollmentFilter.class.Grade =
          {
            branchId:
              Number(branchId),
          };
      }
    }

    /* -----------------------------------
       APPLY ENROLLMENT FILTER
    ----------------------------------- */

    where.enrollments = {
      some: enrollmentFilter,
    };

    /* -----------------------------------
       GENDER FILTER
    ----------------------------------- */

    if (gender) {
      where.gender =
        gender as Gender;
    }

    /* -----------------------------------
       SEARCH FILTER
    ----------------------------------- */

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode:
              "insensitive",
          },
        },

        {
          admissionNo: {
            contains: search,
          },
        },

        {
          phone: {
            contains: search,
          },
        },
      ];
    }

    console.log(
      "FINAL WHERE:",
      JSON.stringify(
        where,
        null,
        2
      )
    );

    /* -----------------------------------
       QUERY
    ----------------------------------- */

    const students =
      await prisma.student.findMany(
        {
          where,

          include: {
            enrollments: {
              where: {
                status:
                  "ACTIVE",
              },

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
        }
      );

    /* -----------------------------------
       RESPONSE
    ----------------------------------- */

    const result =
      students.map((s) => ({
        id: s.id,

        admissionNo:
          s.admissionNo,

        name: s.name,

        phone: s.phone,

        gender: s.gender,

        fatherName:
          s.fatherName,

        img: s.img,

        classId:
          s.enrollments?.[0]
            ?.class?.id ??
          null,

        className:
          s.enrollments?.[0]
            ?.class?.name ??
          null,

        section:
          s.enrollments?.[0]
            ?.class?.section ??
          null,

        grade:
          s.enrollments?.[0]
            ?.class?.Grade
            ?.level ?? null,
      }));

    return NextResponse.json(
      result
    );
  } catch (error: any) {
    console.error(
      "Students API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to fetch students",
      },
      {
        status: 500,
      }
    );
  }
}