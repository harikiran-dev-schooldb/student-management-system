import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const {schoolId} = await params;
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 },
      );
    }

    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        schoolId: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        school,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("School validation error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
