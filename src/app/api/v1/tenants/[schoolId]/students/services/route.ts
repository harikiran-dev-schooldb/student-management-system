export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------------
       1️⃣ Params
    ------------------------------------------------------- */
    const { schoolId: schoolSlug } =
      await params;

    /* -------------------------------------------------------
       2️⃣ Auth
    ------------------------------------------------------- */
    const user =
      await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    /* -------------------------------------------------------
       3️⃣ Resolve School
    ------------------------------------------------------- */
    const school =
      await prisma.schoolInfo.findUnique({
        where: {
          schoolId: schoolSlug,
        },

        select: {
          id: true,
        },
      });

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 },
      );
    }

    /* -------------------------------------------------------
       4️⃣ Fetch Students
    ------------------------------------------------------- */
    const students =
      await prisma.student.findMany({
        where: {
          schoolId: school.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          admissionNo: true,

          transportRequired: true,
          hostelRequired: true,

          enrollments: {
            where: {
              academicYear: {
                isActive: true,
              },
            },

            take: 1,

            select: {
              class: {
                select: {
                  section: true,

                  Grade: {
                    select: {
                      level: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      data: students,
    });

  } catch (error: any) {
    console.error(
      "Student Services GET Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------------
       1️⃣ Params
    ------------------------------------------------------- */
    const { schoolId: schoolSlug } =
      await params;

    /* -------------------------------------------------------
       2️⃣ Auth
    ------------------------------------------------------- */
    const user =
      await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    /* -------------------------------------------------------
       3️⃣ Resolve School
    ------------------------------------------------------- */
    const school =
      await prisma.schoolInfo.findUnique({
        where: {
          schoolId: schoolSlug,
        },

        select: {
          id: true,
        },
      });

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 },
      );
    }

    /* -------------------------------------------------------
       4️⃣ Body
    ------------------------------------------------------- */
    const body = await req.json();

    const {
      studentId,
      transportRequired,
      hostelRequired,
    } = body;

    /* -------------------------------------------------------
       5️⃣ Validate Student
    ------------------------------------------------------- */
    const student =
      await prisma.student.findFirst({
        where: {
          id: studentId,
          schoolId: school.id,
        },
      });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 },
      );
    }

    /* -------------------------------------------------------
       6️⃣ Update Student Services
    ------------------------------------------------------- */
    await prisma.student.update({
      where: {
        id: studentId,
      },

      data: {
        ...(transportRequired !==
          undefined && {
          transportRequired,
        }),

        ...(hostelRequired !==
          undefined && {
          hostelRequired,
        }),
      },
    });

    /* -------------------------------------------------------
       7️⃣ Active Academic Year
    ------------------------------------------------------- */
    const academicYear =
      await prisma.academicYear.findFirst({
        where: {
          schoolId: school.id,
          isActive: true,
        },
      });

    if (!academicYear) {
      return NextResponse.json({
        success: true,
        message:
          "Student updated but no active academic year found",
      });
    }

    /* -------------------------------------------------------
       8️⃣ Student Enrollment
    ------------------------------------------------------- */
    const enrollment =
      await prisma.studentEnrollment.findFirst({
        where: {
          studentId,
          academicYearId:
            academicYear.id,
        },

        include: {
          class: true,
        },
      });

    if (!enrollment) {
      return NextResponse.json({
        success: true,
        message:
          "Student updated but no enrollment found",
      });
    }

    /* -------------------------------------------------------
       9️⃣ TRANSPORT FEES
    ------------------------------------------------------- */
    if (transportRequired === true) {
      const transportFees =
        await prisma.feeStructure.findMany({
          where: {
            schoolId: school.id,

            academicYearId:
              academicYear.id,

            gradeId:
              enrollment.class.gradeId,

            feeType: "TRANSPORT",
          },
        });

      for (const fee of transportFees) {
        await prisma.studentFees.upsert({
          where: {
            studentId_feeCycleId_feeType_academicYearId_schoolId:
              {
                studentId,

                feeCycleId:
                  (fee.feeCycleId as number) || 0,

                feeType:
                  "TRANSPORT",

                academicYearId:
                  academicYear.id,

                schoolId:
                  school.id,
              },
          },

          update: {},

          create: {
            studentId,

            feeStructureId:
              fee.id,

            feeCycleId:
              (fee.feeCycleId as number) || 0,

            feeType:
              "TRANSPORT",

            dueAmount:
              fee.amount || 0,

            paidAmount: 0,

            schoolId:
              school.id,

            academicYearId:
              academicYear.id,
          },
        });
      }
    }

    /* -------------------------------------------------------
       🔟 HOSTEL FEES
    ------------------------------------------------------- */
    if (hostelRequired === true) {
      const hostelFees =
        await prisma.feeStructure.findMany({
          where: {
            schoolId: school.id,

            academicYearId:
              academicYear.id,

            gradeId:
              enrollment.class.gradeId,

            feeType: "HOSTEL",
          },
        });

      for (const fee of hostelFees) {
        await prisma.studentFees.upsert({
          where: {
            studentId_feeCycleId_feeType_academicYearId_schoolId:
              {
                studentId,

                feeCycleId:
                  (fee.feeCycleId as number) || 0,

                feeType:
                  "HOSTEL",

                academicYearId:
                  academicYear.id,

                schoolId:
                  school.id,
              },
          },

          update: {},

          create: {
            studentId,

            feeStructureId:
              fee.id,

            feeCycleId:
              (fee.feeCycleId as number) || 0,

            feeType:
              "HOSTEL",

            dueAmount:
              fee.amount || 0,

            paidAmount: 0,

            schoolId:
              school.id,

            academicYearId:
              academicYear.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Student services updated successfully",
    });

  } catch (error: any) {
    console.error(
      "Student Services PATCH Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}