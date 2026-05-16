export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { studentschema } from "@/lib/formValidationSchemas";
import { createOrUpdateIdentity } from "@/lib/services/identity.service";
import { assignFeesToStudent } from "@/lib/services/fee.service";
import { Gender, Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------------
       1️⃣ Resolve Tenant
    ------------------------------------------------------- */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -------------------------------------------------------
       2️⃣ Authorize
    ------------------------------------------------------- */
    const user = await fetchUserInfo(schoolSlug);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    /* -------------------------------------------------------
       3️⃣ Validate Input
    ------------------------------------------------------- */
    const body = await req.json();
    const parsed = studentschema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const admissionNo = data.admissionNo.trim();
    const username = `s${admissionNo}`;

    /* -------------------------------------------------------
       4️⃣ Prevent Duplicate
    ------------------------------------------------------- */
    const existing = await prisma.student.findFirst({
      where: { admissionNo, schoolId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Admission number already exists." },
        { status: 409 }
      );
    }

    /* -------------------------------------------------------
       5️⃣ Validate Class
    ------------------------------------------------------- */
    const classData = await prisma.class.findFirst({
      where: { id: data.classId, schoolId },
      select: { gradeId: true },
    });

    if (!classData) {
      return NextResponse.json(
        { message: "Invalid class for this school." },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       6️⃣ Get Active Academic Year (REAL ID)
    ------------------------------------------------------- */
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { message: "No active academic year found." },
        { status: 400 }
      );
    }

    if (!data.dob) {
      return NextResponse.json(
        { message: "Date of birth is required." },
        { status: 400 }
      );
    }


    const dob = new Date(data.dob);

    const identity = await createOrUpdateIdentity({
      username,
      phone: data.phone,
      name: data.name,
      role: "student",
      schoolId,
    });

    const normalize = (val?: string | null) =>
      val && val.trim() !== "" ? val : null;

    console.log("Identity result:", {
      clerk_id: identity.clerkId,
      profileId: identity.profileId,
      linkedUserId: identity.linkedUserId,
    });

    /* -------------------------------------------------------
       7️⃣ Atomic Transaction
    ------------------------------------------------------- */
    const student = await prisma.$transaction(async (tx) => {

      /* ---- Create Student ---- */
      const newStudent = await tx.student.create({
        data: {
          admissionNo,
          username,
          name: data.name,
          fatherName: data.fatherName ?? null,
          motherName: data.motherName ?? null,
          fatherQualification: normalize(data.fatherQualification),
          fatherProfession: normalize(data.fatherProfession),
          motherQualification: normalize(data.motherQualification),
          motherProfession: normalize(data.motherProfession),
          email: data.email ?? null,
          phone: data.phone,
          penNo: normalize(data.penNo),
          motherAadhar: normalize(data.motherAadhar),
          fatherAadhar: normalize(data.fatherAadhar),
          studentAadhar: normalize(data.studentAadhar),
          address: data.address,
          gender: data.gender,
          img: data.img ?? null,
          bloodType: data.bloodType ?? null,
          joinedDate: data.joinedDate ? new Date(data.joinedDate) : null,
          nationality: normalize(data.nationality),
          motherTongue: normalize(data.motherTongue),
          religion: data.religion ?? null,
          category: data.category ?? null,
          transportRequired: data.transportRequired ?? false,
          hostelRequired: data.hostelRequired ?? false,
          clerk_id: identity.clerkId,
          profileId: identity.profileId,
          linkedUserId: identity.linkedUserId,
          schoolId,
          dob,
        },
      });

      /* ---- Enrollment ---- */
      await tx.studentEnrollment.create({
        data: {
          studentId: newStudent.id,
          classId: data.classId,
          academicYearId: academicYear.id,
          schoolId,
        },
      });

      /* ---- Fee Structures ---- */
      await assignFeesToStudent(tx, {
        studentId: newStudent.id,
        gradeId: classData.gradeId,
        academicYearId: academicYear.id,
        schoolId,
      });

      console.log("Student created: ", newStudent);

      return newStudent;
    });

    return NextResponse.json(
      { message: "Student created successfully", student },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Student creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate record detected." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -------------------------------------------------------
       1️⃣ Resolve Tenant
    ------------------------------------------------------- */
    const { schoolId: schoolSlug } = await params;

    const schoolId = await resolveSchoolId(
      schoolSlug
    );

    /* -------------------------------------------------------
       2️⃣ Authorize
    ------------------------------------------------------- */
    const user = await fetchUserInfo(schoolSlug);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -------------------------------------------------------
       3️⃣ Query Params
    ------------------------------------------------------- */
    const { searchParams } = new URL(req.url);

    const page =
      Number(searchParams.get("page")) || 1;

    const limit =
      Number(searchParams.get("limit")) || 20;

    const search =
      searchParams.get("search") || "";

    const gender =
      searchParams.get("gender");

    const skip = (page - 1) * limit;

    /* -------------------------------------------------------
       4️⃣ Build Query
    ------------------------------------------------------- */
    const where: Prisma.StudentWhereInput = {
  schoolId,

  ...(gender && {
    gender: gender as Gender,
  }),

  ...(search && {
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
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
    ],
  }),
};

    /* -------------------------------------------------------
       5️⃣ Fetch Data
    ------------------------------------------------------- */
    const [students, total] =
      await prisma.$transaction([
        prisma.student.findMany({
          where,

          orderBy: {
            createdAt: "desc",
          },

          skip,

          take: limit,

          select: {
            id: true,
            name: true,
            admissionNo: true,
            phone: true,
            gender: true,
            fatherName: true,
            img: true,

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
        }),

        prisma.student.count({
          where,
        }),
      ]);

    /* -------------------------------------------------------
       6️⃣ Response
    ------------------------------------------------------- */
    return NextResponse.json(
      {
        success: true,

        data: students,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Students fetch error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
