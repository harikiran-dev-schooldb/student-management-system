import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> },
) {
  try {
    /* -----------------------------
       1️⃣ Resolve Tenant
    ------------------------------ */
    const { schoolId: slug, id: gradeId } = await params;
    const schoolId = await resolveSchoolId(slug);

    if (!gradeId || gradeId.trim() === "") {
      return NextResponse.json(
        { error: "Invalid grade ID" },
        { status: 400 }
      );
    }

    /* -----------------------------
       2️⃣ Authenticate
    ------------------------------ */
    const user = await fetchUserInfo(slug);

    if (!user || !user.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -----------------------------
       3️⃣ Validate Grade (Tenant Safe)
    ------------------------------ */
    const grade = await prisma.grade.findFirst({
      where: {
        id: Number(gradeId),
        schoolId,
      },
      select: { id: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       4️⃣ Fetch Subjects
    ------------------------------ */
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        grades: {
          some: { id: Number(gradeId) },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { subjects },
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch grade subjects error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}