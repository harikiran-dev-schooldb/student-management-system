export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

function normalize(v?: string | null) {
  if (!v) return null;
  const val = v.trim();
  if (val === "" || val === "NA") return null;
  return val;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { teachers } = await req.json();
    console.log("Teachers received:", teachers);

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return NextResponse.json(
        { error: "Invalid teachers array" },
        { status: 400 }
      );
    }

    if (teachers.length > 5000) {
      return NextResponse.json(
        { error: "Upload limit exceeded (max 5000)" },
        { status: 400 }
      );
    }

    /* ----------------------------------
       Load classes
    ----------------------------------- */

    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true }
    });

    const classSet = new Set(classes.map(c => c.id));

    /* ----------------------------------
       Active academic year
    ----------------------------------- */

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true }
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    const prepared: any[] = [];
    const classAssignments: any[] = [];
    const errors: string[] = [];

    /* ----------------------------------
       Parse CSV rows
    ----------------------------------- */

    teachers.forEach((t: any, index: number) => {

      if (!t.id || !t.username || !t.name || !t.phone || !t.address || !t.gender) {
        errors.push(`Row ${index + 1}: Missing required fields`);
        return;
      }

      const dob = t.dob ? new Date(t.dob) : null;

      prepared.push({
        id: t.id,
        username: t.username.trim(),
        name: t.name.trim(),
        parentName: normalize(t.parentName),
        email: normalize(t.email),
        phone: t.phone.trim(),
        address: t.address.trim(),
        img: normalize(t.img),
        bloodType: normalize(t.bloodType),
        gender: t.gender,
        dob,
        clerk_id: normalize(t.clerk_id),
        schoolId
      });

      if (t.classId && classSet.has(Number(t.classId))) {
        classAssignments.push({
          teacherId: t.id,
          classId: Number(t.classId),
          academicYearId: academicYear.id,
          schoolId,
          role: "SUBJECT"
        });
      }

    });

    if (prepared.length === 0) {
      return NextResponse.json(
        { error: "No valid rows", errors },
        { status: 400 }
      );
    }

    /* ----------------------------------
       Find existing teachers
    ----------------------------------- */

    const existing = await prisma.teacher.findMany({
      where: {
        schoolId,
        username: { in: prepared.map(t => t.username) }
      },
      select: { username: true }
    });

    const existingSet = new Set(existing.map(t => t.username));

    const toInsert = prepared.filter(t => !existingSet.has(t.username));
    const toUpdate = prepared.filter(t => existingSet.has(t.username));

    /* ----------------------------------
       Transaction
    ----------------------------------- */

    await prisma.$transaction(async tx => {

      if (toInsert.length) {
        await tx.teacher.createMany({
          data: toInsert,
          skipDuplicates: true
        });
      }

      for (const t of toUpdate) {
        await tx.teacher.update({
          where: {
            username_schoolId: {
              username: t.username,
              schoolId
            }
          },
          data: t
        });
      }

      if (classAssignments.length) {
        await tx.teacherClassAssignment.createMany({
          data: classAssignments,
          skipDuplicates: true
        });
      }

    });

    return NextResponse.json({
      message: "Bulk upload completed",
      inserted: toInsert.length,
      updated: toUpdate.length,
      total: prepared.length,
      errors
    });

  } catch (error) {
    console.error("Bulk teacher upload error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}