import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      studentIds,
      fromClassId,
      toClassId,
      academicYear,
    } = await req.json();

    await prisma.$transaction(
      studentIds.map((studentId: string) =>
        prisma.student.update({
          where: { id: studentId },
          data: {
            classId: toClassId,
            academicYear,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Promotion successful",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Promotion failed" },
      { status: 500 }
    );
  }
}
