import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ======================================================
   GET → Validate School Slug (Public)
====================================================== */
export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolSlug = context.params.schoolId;

    if (!schoolSlug) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 }
      );
    }

    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: schoolSlug }, // slug lookup
      select: {
        id: true,
        name: true,
        schoolId: true,
        logo: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        school,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("School validation error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}