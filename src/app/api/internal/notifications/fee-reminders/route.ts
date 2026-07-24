export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyStudents } from "@/lib/notifications";
import { getMessageContent } from "@/lib/utils/messageUtils";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Sends one fee reminder per student per UTC day. Vercel invokes this route
 * through vercel.json; it can also be triggered manually with CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = startOfTodayUtc();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const outstandingFees = await prisma.studentFees.findMany({
      where: {
        dueAmount: { gt: 0 },
        academicYear: { isActive: true },
        student: { status: "ACTIVE" },
      },
      select: {
        studentId: true,
        schoolId: true,
        dueAmount: true,
        feeCycle: { select: { name: true } },
        student: {
          select: {
            name: true,
            enrollments: {
              where: { status: "ACTIVE" },
              take: 1,
              select: { class: { select: { name: true, section: true } } },
            },
          },
        },
      },
    });

    if (!outstandingFees.length) {
      return NextResponse.json({ success: true, reminders: 0, delivered: 0 });
    }

    const studentIds = [...new Set(outstandingFees.map((fee) => fee.studentId))];
    const alreadyReminded = await prisma.messages.findMany({
      where: {
        type: "FEE_RELATED",
        date: { gte: today, lt: tomorrow },
        studentId: { in: studentIds },
      },
      select: { studentId: true, schoolId: true },
    });
    const alreadyRemindedKeys = new Set(
      alreadyReminded.map((message) => `${message.schoolId}:${message.studentId}`),
    );

    const schoolIds = [...new Set(outstandingFees.map((fee) => fee.schoolId))];
    const schools = await prisma.schoolInfo.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true, name: true },
    });
    const schoolNames = new Map(schools.map((school) => [school.id, school.name]));

    const reminders = new Map<
      string,
      {
        schoolId: string;
        studentId: string;
        studentName: string;
        className: string | null;
        amount: number;
        cycles: Set<string>;
      }
    >();

    for (const fee of outstandingFees) {
      const key = `${fee.schoolId}:${fee.studentId}`;
      if (alreadyRemindedKeys.has(key)) continue;

      const current = reminders.get(key) ?? {
        schoolId: fee.schoolId,
        studentId: fee.studentId,
        studentName: fee.student.name,
        className: fee.student.enrollments[0]?.class.name ?? null,
        amount: 0,
        cycles: new Set<string>(),
      };

      current.amount += Number(fee.dueAmount ?? 0);
      if (fee.feeCycle?.name) current.cycles.add(fee.feeCycle.name);
      reminders.set(key, current);
    }

    const reminderList = [...reminders.values()];
    if (!reminderList.length) {
      return NextResponse.json({ success: true, reminders: 0, delivered: 0 });
    }

    await prisma.messages.createMany({
      data: reminderList.map((reminder) => ({
        type: "FEE_RELATED",
        message: getMessageContent("FEE_RELATED", {
          studentName: reminder.studentName,
          className: reminder.className,
          schoolName: schoolNames.get(reminder.schoolId) ?? "School",
          amount: reminder.amount,
          feeCycleName: [...reminder.cycles].join(", ") || "current fees",
          date: new Date(),
        }),
        studentId: reminder.studentId,
        schoolId: reminder.schoolId,
        date: new Date(),
      })),
    });

    const bySchool = new Map<string, string[]>();
    for (const reminder of reminderList) {
      bySchool.set(reminder.schoolId, [
        ...(bySchool.get(reminder.schoolId) ?? []),
        reminder.studentId,
      ]);
    }

    const deliveryResults = await Promise.all(
      [...bySchool].map(([schoolId, recipientIds]) =>
        notifyStudents({
          schoolId,
          studentIds: recipientIds,
          title: "Fee payment reminder",
          body: "You have an outstanding school fee. Open SchoolDB to view details.",
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      reminders: reminderList.length,
      delivered: deliveryResults.reduce((total, result) => total + result.sent, 0),
    });
  } catch (error) {
    console.error("Fee reminder job failed", error);
    return NextResponse.json({ error: "Failed to send fee reminders" }, { status: 500 });
  }
}
