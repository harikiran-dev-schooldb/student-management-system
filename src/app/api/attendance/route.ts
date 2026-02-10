import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const classId = searchParams.get("classId");

    if (!dateParam || !classId) {
      return NextResponse.json(
        { error: "Missing date or classId" },
        { status: 400 }
      );
    }

    // ✅ Convert YYYY-MM-DD → DateTime
    const date = new Date(`${dateParam}T00:00:00.000Z`);

    const records = await prisma.attendance.findMany({
      where: {
        date,
        classId: Number(classId),
      },
      select: {
        studentId: true,
        present: true,
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
