import Messages from "@/components/Announcements";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SingleStudentSelect } from "../../../../../../../types/query-types";
import Avatar from "@/components/Avatar";
import {
  GraduationCap,
  BookOpen,
  Users,
  Activity,
  Droplets,
  Mail,
  Phone,
  Calendar,
  CalendarDays,
} from "lucide-react";

interface StudentSinglePageProps {
  params: Promise<{ id: string }>;
}

/* --- Styles & Tokens --- */
const cardClass =
  "bg-white dark:bg-[#121727] rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md";

const metricCardClass =
  "bg-white dark:bg-[#121727] p-4 rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 transition-transform hover:-translate-y-1";

/* --- Helper Components --- */
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
      <Icon size={16} />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span
        className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]"
        title={value}
      >
        {value}
      </span>
    </div>
  </div>
);

const SingleStudentPage = async ({ params }: StudentSinglePageProps) => {
  const { id } = await params;
  const { role } = await fetchUserInfo();

  const student = await prisma.student.findUnique({
    where: { id },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 xl:flex-row bg-gray-50/50 dark:bg-[#0d1117] min-h-screen">
      {/* ================= LEFT COLUMN (Profile, Metrics, Schedule) ================= */}
      <div className="w-full xl:w-3/4 space-y-6">
        {/* 1. TOP SECTION: Profile + Quick Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* A. User Profile Card */}
          <div
            className={`${cardClass} flex flex-1 flex-col sm:flex-row gap-6 p-6 items-start relative`}
          >
            {/* Avatar Area */}
            <div className="relative shrink-0 mx-auto sm:mx-0 group">
              <div className="w-28 h-28 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-900/20 overflow-hidden relative">
                <Avatar
                  src={student.img}
                  name={student.name}
                  gender={student.gender}
                  size={112} // 28 * 4
                  href={`list/users/students/${student.id}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Role Badge */}
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border-2 border-white dark:border-[#121727] shadow-sm z-10">
                STUDENT
              </div>
            </div>

            {/* Info Area */}
            <div className="flex flex-col flex-1 gap-5 w-full">
              <div className="text-center sm:text-left border-b border-gray-100 dark:border-gray-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {student.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <span className="capitalize">{student.gender}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                      ID: {student.id}
                    </span>
                  </p>
                </div>
                {role === "admin" && (
                  <FormContainer
                    table="student"
                    type="update"
                    data={{
                      ...student,
                      dob: student.dob
                        ? student.dob.toISOString().split("T")[0]
                        : "",
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={student.email || "N/A"}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={student.phone || "N/A"}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Birthday"
                  value={
                    student.dob
                      ? new Intl.DateTimeFormat("en-GB").format(
                          new Date(student.dob)
                        )
                      : "N/A"
                  }
                />
                <InfoRow
                  icon={Droplets}
                  label="Blood Type"
                  value={student.bloodType || "N/A"}
                />
              </div>
            </div>
          </div>

          {/* B. KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1 lg:max-w-md">
            {/* Attendance KPI */}
            <div className={metricCardClass}>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 dark:text-indigo-400">
                <Activity size={24} />
              </div>
              <div className="flex-1">
                <Suspense
                  fallback={
                    <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  }
                >
                  <StudentAttendanceCard id={student.id} />
                </Suspense>
              </div>
            </div>

            {/* Grade KPI */}
            <div className={metricCardClass}>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-full text-rose-600 dark:text-rose-400">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {student.Class.Grade.level}
                </h2>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Grade
                </span>
              </div>
            </div>

            {/* Lessons KPI */}
            <div className={metricCardClass}>
              <div className="p-2.5 bg-sky-50 dark:bg-sky-900/20 rounded-full text-sky-600 dark:text-sky-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {student.Class._count.lessons}
                </h2>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Lessons
                </span>
              </div>
            </div>

            {/* Class KPI */}
            <div className={metricCardClass}>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {student.Class.section}
                </h2>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Class
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TIMETABLE SECTION */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Weekly Schedule
            </h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
              {student.Class.Grade.level} - {student.Class.section}
            </span>
          </div>
          <ClassTimetableContainer classId={student.Class.id} />
        </div>
      </div>

      {/* ================= RIGHT COLUMN (Calendar, Messages) ================= */}
      <div className="w-full xl:w-1/4 space-y-6">
        {/* Attendance Calendar Widget */}
        <div className={`${cardClass} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            Attendance History
          </h3>
          <AttendanceCalendar
            attendanceData={student.attendances.map((a) => ({
              date: a.date,
              present: a.present,
            }))}
          />
        </div>

        {/* Announcements/Messages Widget */}
        <div className={`${cardClass} p-5`}>
          <Messages />
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;
