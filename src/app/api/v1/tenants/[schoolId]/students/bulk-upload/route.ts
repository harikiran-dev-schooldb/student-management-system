export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { processStudentChunk } from "@/lib/services/studentBulkProcessor";

const CHUNK_SIZE = 500;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const { students } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    /* -----------------------------
       Create Upload Session
    --------------------------------*/
    const session = await prisma.uploadSession.create({
      data: {
        schoolId,
        total: students.length,
      },
    });

    /* -----------------------------
       Load Required Data ONCE
    --------------------------------*/
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      );
    }

    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, gradeId: true },
    });

    const classMap = new Map(classes.map(c => [c.id, c.gradeId]));

    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId,
        academicYearId: academicYear.id,
      },
    });

    const feeMap = new Map<number, typeof feeStructures>();

    for (const fee of feeStructures) {
      if (!feeMap.has(fee.gradeId)) feeMap.set(fee.gradeId, []);
      feeMap.get(fee.gradeId)!.push(fee);
    }

    /* -----------------------------
       Process in Chunks (NO TX)
    --------------------------------*/
    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);

      await processStudentChunk({
        chunk,
        schoolId,
        academicYearId: academicYear.id,
        classMap,
        feeMap,
        sessionId: session.id,
      });
    }

    /* -----------------------------
       Mark Upload Complete
    --------------------------------*/
    await prisma.uploadSession.update({
      where: { id: session.id },
      data: { status: "done" },
    });

    return NextResponse.json({
      message: "Upload completed",
      sessionId: session.id,
      total: students.length,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}