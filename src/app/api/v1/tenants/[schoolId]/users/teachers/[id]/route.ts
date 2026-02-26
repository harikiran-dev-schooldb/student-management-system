export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { teacherschema } from "@/lib/formValidationSchemas";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
): Promise<NextResponse> {
  try {
    /* =====================================================
       1️⃣ Resolve Tenant + Authorize
    ===================================================== */
    const { schoolId: schoolSlug, id: teacherId } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const currentUser = await fetchUserInfo(schoolId);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================================================
       2️⃣ Validate Input
    ===================================================== */
    const body = await req.json();
    const parsed = teacherschema.safeParse({ ...body, id: teacherId });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const client = await clerkClient();

    /* =====================================================
       3️⃣ Ensure Teacher Belongs To School
    ===================================================== */
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
      },
      include: {
        linkedUser: true,
      },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    /* =====================================================
       4️⃣ Prevent Duplicate Username (Per School)
    ===================================================== */
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

    /* =====================================================
       5️⃣ Transaction Update
    ===================================================== */
    const updatedTeacher = await prisma.$transaction(async (tx) => {
      /* ----- Update Teacher ----- */
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
          classId: data.classId ?? null,
          supervisor: data.supervisor ?? false,
        },
      });

      /* ----- Sync LinkedUser Username ----- */
      if (existingTeacher.linkedUser) {
        await tx.linkedUser.update({
          where: { id: existingTeacher.linkedUser.id },
          data: { username: data.username },
        });
      }

      /* ----- Subject Assignment (Tenant Safe) ----- */
      if (Array.isArray(data.subjects)) {
        // Remove only inside this school
        await tx.subjectTeacher.deleteMany({
          where: { teacherId, schoolId },
        });

        const validSubjects = data.subjects.filter(
          (s: any) => s.subjectId && s.classId
        );

        if (validSubjects.length > 0) {
          // Validate subjects belong to school
          const subjectIds = validSubjects.map((s: any) =>
            Number(s.subjectId)
          );

          const validSubjectRecords = await tx.subject.findMany({
            where: {
              id: { in: subjectIds },
              schoolId,
            },
            select: { id: true },
          });

          if (validSubjectRecords.length !== subjectIds.length) {
            throw new Error("Invalid subject assignment detected.");
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

    /* =====================================================
       6️⃣ Clerk Sync (Optional)
    ===================================================== */
    if (existingTeacher.clerk_id) {
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
      { status: error.name === "ZodError" ? 400 : 500 }
    );
  }
}