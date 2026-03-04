export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    /* -----------------------------
       2️⃣ Authorize (Admin Only)
    ------------------------------ */
    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* -----------------------------
       3️⃣ Parse Input
    ------------------------------ */
    const { teachers } = await req.json();

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return NextResponse.json(
        { error: "Invalid teachers array" },
        { status: 400 },
      );
    }

    if (teachers.length > 5000) {
      return NextResponse.json(
        { error: "Upload limit exceeded (max 5000)" },
        { status: 400 },
      );
    }

    const errors: string[] = [];
    const prepared: any[] = [];

    /* -----------------------------
       4️⃣ Preload Valid Classes
    ------------------------------ */
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true },
    });

    const validClassSet = new Set(classes.map((c) => c.id));

    /* -----------------------------
       5️⃣ Validate Rows
    ------------------------------ */
    for (let i = 0; i < teachers.length; i++) {
      const t = teachers[i];

      if (
        !t.id ||
        !t.username ||
        !t.name ||
        !t.phone ||
        !t.address ||
        !t.gender
      ) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      const classId =
        t.classId && validClassSet.has(Number(t.classId))
          ? Number(t.classId)
          : null;

      prepared.push({
        id: t.id,
        username: t.username.trim(),
        name: t.name,
        parentName: t.parentName || undefined,
        email: t.email || undefined,
        phone: t.phone,
        address: t.address,
        img: t.img || undefined,
        bloodType: t.bloodType || undefined,
        gender: t.gender,
        dob: t.dob ? new Date(t.dob) : undefined,
        clerk_id: t.clerk_id || undefined,
        schoolId,
      });


    }

    if (!prepared.length) {
      return NextResponse.json(
        { error: "No valid records to insert", errors },
        { status: 400 },
      );
    }

    /* -----------------------------
       6️⃣ Fetch Existing (Single Queries)
    ------------------------------ */
    const usernames = prepared.map((t) => t.username);
    const ids = prepared.map((t) => t.id);
    const clerkIds = prepared.map((t) => t.clerk_id).filter(Boolean);

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }


    const existingTeachers = await prisma.teacher.findMany({
      where: {
        schoolId,
        OR: [
          { username: { in: usernames } },
          { id: { in: ids } },
          { clerk_id: { in: clerkIds } },
        ],
      },
      select: {
        username: true,
        id: true,
        clerk_id: true,
      },
    });

    /* -----------------------------
   7️⃣ Insert OR Update (UPSERT)
------------------------------ */

    let inserted = 0;
    let updated = 0;

    // Build quick lookup set
    const existingUsernameSet = new Set(
      existingTeachers.map((t) => t.username)
    );

    await prisma.$transaction(
      prepared.map((t) => {
        const isExisting = existingUsernameSet.has(t.username);

        if (isExisting) updated++;
        else inserted++;

        return prisma.teacher.upsert({
          where: {
            username_schoolId: {
              username: t.username,
              schoolId,
            },
          },
          update: {
            name: t.name,
            parentName: t.parentName,
            email: t.email,
            phone: t.phone,
            address: t.address,
            img: t.img,
            bloodType: t.bloodType,
            gender: t.gender,
            dob: t.dob,
            clerk_id: t.clerk_id,
            status: "ACTIVE",
          },
          create: {
            ...t,
          },
        });
      })
    );


    return NextResponse.json({
      message: "Bulk upload completed",
      inserted,
      updated,
      total: prepared.length,
    });
  } catch (error) {
    console.error("Bulk Teacher Upload Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
