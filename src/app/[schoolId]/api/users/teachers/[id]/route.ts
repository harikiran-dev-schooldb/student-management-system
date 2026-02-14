import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { teacherschema } from "@/lib/formValidationSchemas";
import { revalidatePath } from "next/cache";

const client = await clerkClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; schoolId: string }> },
): Promise<NextResponse> {
  try {
    const { id: teacherId, schoolId } = await params;
    const body = await req.json();

    const data = teacherschema.parse({ ...body, id: teacherId });

    /* -----------------------------------------
       1️⃣ Ensure Teacher Belongs To This School
    ------------------------------------------ */
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
      },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 },
      );
    }

    /* -----------------------------------------
       2️⃣ Prevent Username Duplicate (Per School)
    ------------------------------------------ */
    if (data.username) {
      const duplicate = await prisma.teacher.findFirst({
        where: {
          username: data.username,
          schoolId,
          NOT: { id: teacherId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Username already exists in this school" },
          { status: 409 },
        );
      }
    }

    /* -----------------------------------------
       3️⃣ Update Teacher
    ------------------------------------------ */
    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        username: data.username,
        name: data.name,
        parentName: data.parentName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img,
        bloodType: data.bloodType,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        classId: data.classId ?? null,
        supervisor: data.supervisor ?? false,
      },
    });

    /* -----------------------------------------
       4️⃣ Update Subject-Class Mapping (Tenant Safe)
    ------------------------------------------ */
    if (Array.isArray(data.subjects)) {
      // delete only inside this school
      await prisma.subjectTeacher.deleteMany({
        where: {
          teacherId,
          schoolId,
        },
      });

      const validSubjects = data.subjects.filter(
        (s: any) => s.subjectId && s.classId,
      );

      if (validSubjects.length > 0) {
        await prisma.subjectTeacher.createMany({
          data: validSubjects.map((s: any) => ({
            subjectId: Number(s.subjectId),
            classId: Number(s.classId),
            teacherId,
            schoolId, // 🔒 REQUIRED
          })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath("/list/users/teachers");

    return NextResponse.json(
      { success: true, updatedTeacher },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Teacher update error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.name === "ZodError" ? 400 : 500 },
    );
  }
}
