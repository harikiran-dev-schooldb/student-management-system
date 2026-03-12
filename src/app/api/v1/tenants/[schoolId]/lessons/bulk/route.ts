export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {

    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const user = await fetchUserInfo(slug);

    if (!user.userId || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin allowed" },
        { status: 403 }
      );
    }

    const { lessons } = await req.json();

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ---- Split actions ---- */

    const createRows: any[] = [];
    const updateRows: any[] = [];
    const deleteIds: number[] = [];

    const subjectIds = [...new Set(createRows.map(l => Number(l.subjectId)))];

    const subjects = await prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
        schoolId
      }
    });

    const subjectMap = new Map(
      subjects.map(s => [String(s.id), s.name])
    );

    for (const lesson of lessons) {

      // CSV uploads default to CREATE
      if (!lesson.action || lesson.action === "create") {
        createRows.push(lesson);
        continue;
      }

      if (lesson.action === "update") {
        updateRows.push(lesson);
        continue;
      }

      if (lesson.action === "delete") {
        deleteIds.push(Number(lesson.id));
      }
    }

    const toTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    console.log({
      total: lessons.length,
      create: createRows.length,
      update: updateRows.length,
      delete: deleteIds.length
    });

    /* ---- Prepare create data ---- */

    const createData = createRows.map((lesson) => {

      const periodKey = lesson.period as keyof typeof PERIOD_TIMINGS;
      const timing = PERIOD_TIMINGS[periodKey];

      return {
        title: subjectMap.get(lesson.subjectId) || "UNKNOWN",
        day: lesson.day,
        period: periodKey,
        startTime: toTime(timing.start),
        endTime: toTime(timing.end),
        subjectId: Number(lesson.subjectId),
        classId: Number(lesson.classId),
        teacherId: lesson.teacherId,
        schoolId
      };
    });

    /* ---- Transaction ---- */

    await prisma.$transaction(async (tx) => {

      /* DELETE */

      if (deleteIds.length) {
        await tx.lesson.deleteMany({
          where: {
            id: { in: deleteIds },
            schoolId
          }
        });
      }

      /* CREATE */

      if (createData.length) {
        await tx.lesson.createMany({
          data: createData
        });
      }

      /* UPDATE */

      for (const lesson of updateRows) {

        await tx.lesson.update({
          where: {
            id: lesson.id
          },
          data: {
            title: lesson.title,
            teacherId: lesson.teacherId,
            subjectId: lesson.subjectId
          }
        });
      }

    }, { timeout: 20000 });

    return NextResponse.json({
      message: "Bulk operation successful",
      created: createData.length,
      updated: updateRows.length,
      deleted: deleteIds.length
    });

  } catch (error: any) {

    console.error("Bulk lesson API error:", error);

    return NextResponse.json(
      { error: error.message || "Bulk operation failed" },
      { status: 500 }
    );
  }
}