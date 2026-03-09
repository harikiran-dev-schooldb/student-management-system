export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { teacherschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
): Promise<NextResponse> {

  try {

    /* 1️⃣ Resolve tenant */

    const { schoolId: schoolSlug, id: teacherId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const currentUser = await fetchUserInfo(schoolSlug);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 2️⃣ Validate */

    const body = await req.json();
    const parsed = teacherschema.safeParse({ ...body, id: teacherId });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    /* 3️⃣ Ensure teacher exists */

    const existingTeacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
      include: { linkedUser: true },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    /* 4️⃣ Username duplicate check */

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
          { error: "Username already exists in this school" },
          { status: 409 }
        );
      }
    }

    /* 5️⃣ Transaction */

    const updatedTeacher = await prisma.$transaction(async (tx) => {

      const teacher = await tx.teacher.update({
        where: { id: teacherId },
        data: {
          username: data.username,
          name: data.name,
          parentName: data.parentName ?? null,
          email: data.email ?? null,
          phone: data.phone,
          address: data.address,
          img: data.img ?? null,
          bloodType: data.bloodType ?? null,
          gender: data.gender,
          dob: data.dob ? new Date(data.dob) : null,
        },
      });

      /* Sync linked user */

      if (existingTeacher.linkedUser) {
        await tx.linkedUser.update({
          where: { id: existingTeacher.linkedUser.id },
          data: { username: data.username },
        });
      }

      /* Subject assignment */

      if (Array.isArray(data.subjects)) {

        await tx.subjectTeacher.deleteMany({
          where: { teacherId, schoolId },
        });

        const validSubjects = data.subjects.filter(
          (s: any) => s.subjectId && s.classId
        );

        if (validSubjects.length > 0) {

          const subjectIds = validSubjects.map((s: any) =>
            Number(s.subjectId)
          );

          const classIds = validSubjects.map((s: any) =>
            Number(s.classId)
          );

          const [subjects, classes] = await Promise.all([
            tx.subject.findMany({
              where: { id: { in: subjectIds }, schoolId },
              select: { id: true },
            }),
            tx.class.findMany({
              where: { id: { in: classIds }, schoolId },
              select: { id: true },
            }),
          ]);

          if (
            subjects.length !== subjectIds.length ||
            classes.length !== classIds.length
          ) {
            throw new Error("Invalid subject/class assignment detected.");
          }

          await tx.subjectTeacher.createMany({
            data: validSubjects.map((s: any) => ({
              subjectId: Number(s.subjectId),
              classId: Number(s.classId),
              teacherId,
              schoolId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return teacher;
    });

    /* 6️⃣ Clerk sync */

    if (existingTeacher.clerk_id) {
      const client = await clerkClient();

      await client.users.updateUser(existingTeacher.clerk_id, {
        firstName: data.name,
      });
    }

    revalidatePath(`/${schoolSlug}/users/teachers`);

    return NextResponse.json(
      { success: true, data: updatedTeacher },
      { status: 200 }
    );

  } catch (error: any) {

    console.error("Teacher update error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}