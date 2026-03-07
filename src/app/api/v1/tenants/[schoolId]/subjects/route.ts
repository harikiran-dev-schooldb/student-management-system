export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

/* ======================================================
   POST → Create Subject (Admin Only)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, gradeId } = body;

    if (!name || !Array.isArray(gradeId) || gradeId.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    /* -------------------------
       Check Duplicate
    -------------------------- */
    const existing = await prisma.subject.findUnique({
      where: {
        name_schoolId: {
          name: trimmedName,
          schoolId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Subject "${trimmedName}" already exists.` },
        { status: 409 }
      );
    }

    /* -------------------------
       Validate Grades
    -------------------------- */
    const validGrades = await prisma.grade.findMany({
      where: {
        id: { in: gradeId.map(Number) },
        schoolId,
      },
      select: { id: true },
    });

    if (validGrades.length !== gradeId.length) {
      return NextResponse.json(
        { error: "Some grade IDs are invalid." },
        { status: 400 }
      );
    }

    /* -------------------------
       Create Subject
    -------------------------- */
    const subject = await prisma.subject.create({
      data: {
        name: trimmedName,
        schoolId,
        grades: {
          connect: validGrades.map(g => ({ id: g.id })),
        },
      },
      include: { grades: true },
    });

    return NextResponse.json(subject, { status: 201 });

  } catch (error: any) {
    console.error("Subject POST error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate subject." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ======================================================
   GET → Fetch Subjects (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = user.schoolId;

    console.log("Fetching subjects for School ID:", schoolId);
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get("gradeId");

    const where: any = { schoolId };

    if (gradeId) {
      where.grades = {
        some: { id: Number(gradeId) },
      };
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: { grades: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects, { status: 200 });

  } catch (error) {
    console.error("Subject GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}