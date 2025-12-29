import AttendanceCalendar from "@/components/AttendanceCalendar";
import prisma from "@/lib/prisma";
import { SingleStudentSelect } from "../../../../../../../types/query-types";
import { notFound } from "next/navigation";

interface StudentAttendancePageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendancePage({
  params,
}: StudentAttendancePageProps) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  /* ================= ATTENDANCE STATS ================= */

  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter(
    (a) => a.present === true
  ).length;
  const absentDays = student.attendances.filter(
    (a) => a.present === false
  ).length;

  const attendancePercent =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
      {/* ================= STUDENT MINI INFO ================= */}
      <div
        className="rounded-xl border p-4
                   bg-white dark:bg-[#121727]
                   border-gray-200 dark:border-white/10"
      >
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {student.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Class {student.Class.Grade.level} – {student.Class.section}
          {" · "}Adm No: {student.id}
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Present" value={presentDays} color="green" />
        <StatCard title="Absent" value={absentDays} color="red" />
        <StatCard
          title="Attendance"
          value={`${attendancePercent}%`}
          color="yellow"
        />
      </div>

      {/* ================= CALENDAR ================= */}
      <div
        className="rounded-xl border p-4
                   bg-white dark:bg-[#121727]
                   border-gray-200 dark:border-white/10"
      >
        <AttendanceCalendar
          attendanceData={student.attendances.map((a) => ({
            date: a.date,
            present: a.present,
          }))}
        />
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: "green" | "red" | "yellow";
}) {
  const colorMap = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div
      className="rounded-lg border p-4
                 bg-white dark:bg-[#121727]
                 border-gray-200 dark:border-white/10"
    >
      <p className="text-xs uppercase text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className={`text-2xl font-semibold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}
