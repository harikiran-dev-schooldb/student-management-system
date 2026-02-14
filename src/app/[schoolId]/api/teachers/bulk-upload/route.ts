import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { teachers } = await req.json();

    if (!Array.isArray(teachers)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    /* -----------------------------
       Format + Inject schoolId
    ------------------------------ */
    const formatted = teachers.map((t: any) => ({
      id: t.id,
      username: t.username,
      name: t.name,
      parentName: t.parentName || undefined,
      email: t.email || undefined,
      phone: t.phone,
      address: t.address,
      img: t.img || undefined,
      bloodType: t.bloodType || undefined,
      gender: t.gender,
      dob: t.dob ? new Date(t.dob) : undefined,
      classId: t.classId ? Number(t.classId) : null,
      clerk_id: t.clerk_id || undefined,
      schoolId, // ✅ REQUIRED
    }));

    /* -----------------------------
       Duplicate Checks (Tenant Safe)
    ------------------------------ */

    const existingUsernames = await prisma.teacher.findMany({
      where: {
        username: { in: formatted.map((t) => t.username) },
        schoolId,
      },
      select: { username: true },
    });

    const existingIds = await prisma.teacher.findMany({
      where: {
        id: { in: formatted.map((t) => t.id) },
        schoolId,
      },
      select: { id: true },
    });

    const validClassIds = formatted
      .map((t) => t.classId)
      .filter((id): id is number => typeof id === "number");

    const existingClassIds = await prisma.teacher.findMany({
      where: {
        classId: { in: validClassIds },
        schoolId,
      },
      select: { classId: true },
    });

    const existingClerkIds = await prisma.teacher.findMany({
      where: {
        clerk_id: {
          in: formatted.map((t) => t.clerk_id).filter(Boolean),
        },
        schoolId,
      },
      select: { clerk_id: true },
    });

    /* -----------------------------
       Detect duplicates
    ------------------------------ */
    const duplicates = formatted.filter(
      (t) =>
        existingUsernames.some((e) => e.username === t.username) ||
        existingIds.some((e) => e.id === t.id) ||
        (t.classId &&
          existingClassIds.some((e) => e.classId === t.classId)) ||
        (t.clerk_id &&
          existingClerkIds.some((e) => e.clerk_id === t.clerk_id))
    );

    const toInsert = formatted.filter((t) => !duplicates.includes(t));

    /* -----------------------------
       Insert
    ------------------------------ */
    if (toInsert.length > 0) {
      await prisma.teacher.createMany({
        data: toInsert,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: `Upload complete: Inserted ${toInsert.length}, Skipped ${duplicates.length}`,
      duplicates,
    });
  } catch (err) {
    console.error("Bulk Teacher Upload Error:", err);
    return NextResponse.json(
      { message: "Upload failed", error: (err as any)?.message },
      { status: 500 }
    );
  }
}
