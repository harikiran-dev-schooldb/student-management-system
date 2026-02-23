import FeesTableContainer from "@/components/fees/FeesTableContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Avatar from "@/components/Avatar";
import {
  Mail,
  Phone,
  CalendarDays,
  Droplets,
  GraduationCap,
  Users,
  Activity,
  BookOpen,
  FileText,
  ScrollText,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { SingleStudentFeeSelect } from "../../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

interface StudentFeePageProps {
  params: Promise<{ mode: string; id: string; schoolId: string }>;
}

/* --- Styles & Tokens --- */
const cardClass =
  "bg-white dark:bg-darkMode rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md";

const metricCardClass =
  "bg-white dark:bg-darkMode p-4 rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 transition-transform hover:-translate-y-1";

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

const QuickLink = ({
  href,
  icon: Icon,
  label,
  colorClass,
}: {
  href: string;
  icon: any;
  label: string;
  colorClass: string;
}) => (
  <Link
    href={href}
    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-md ${colorClass} bg-opacity-10 dark:bg-opacity-20`}
      >
        <Icon size={18} className={colorClass.replace("bg-", "text-")} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {label}
      </span>
    </div>
    <ChevronRight
      size={16}
      className="text-gray-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1"
    />
  </Link>
);

const StudentFeePage = async ({ params }: StudentFeePageProps) => {
  const { schoolId: slug, mode, id } = await params;

  if (!["collect", "cancel", "view"].includes(mode)) {
    notFound();
  }

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) notFound();

  const db = tenantPrisma(school.id);

  const { role, studentId } = await fetchUserInfo(slug);

  if (role === "student" && id !== studentId) {
    notFound();
  }

  const student = await db.student.findFirst({
    where: { id },
    select: SingleStudentFeeSelect,
  });

  if (!student) notFound();

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50 dark:bg-darkMode">
      {/* ================= TOP SECTION: Profile & Quick Links ================= */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT: Profile + KPIs */}
        <div className="w-full xl:w-3/4 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* A. User Profile Card */}
            <div
              className={`${cardClass} flex flex-1 flex-col sm:flex-row gap-6 p-6 items-start relative`}
            >
              {/* Avatar Area */}
              <div className="relative shrink-0 mx-auto sm:mx-0 group">
                <div className="w-24 h-24 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-900/20 overflow-hidden relative">
                  <Avatar
                    src={student.img}
                    name={student.name}
                    gender={student.gender}
                    size={96}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
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
                            new Date(student.dob),
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

              <div className={metricCardClass}>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 dark:text-indigo-400">
                  <Activity size={24} />
                </div>
                <div className="flex-1">
                  <Suspense
                    fallback={
                      <div className="h-6 w-12 bg-gray-100 rounded animate-pulse" />
                    }
                  >
                    <StudentAttendanceCard id={student.id} />
                  </Suspense>
                </div>
              </div>

              {/* Date Card (Replaces Status) */}
              <div className={metricCardClass}>
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-600 dark:text-orange-400">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </h2>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Actions (Filtered) */}
        <div className="w-full xl:w-1/4">
          <div className={`${cardClass} p-5 h-full`}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              Quick Actions
            </h3>

            <div className="flex flex-col gap-2">
              {student.Class.id && (
                <>
                  <QuickLink
                    href={`/list/homeworks?classId=${student.Class.id}`}
                    icon={BookOpen}
                    label="Homeworks"
                    colorClass="bg-yellow-500 text-yellow-600"
                  />
                  <QuickLink
                    href={`/list/exams?classId=${student.Class.id}`}
                    icon={FileText}
                    label="Exams"
                    colorClass="bg-sky-500 text-sky-600"
                  />
                  {/* REMOVED: Teachers, Assignments, Lessons */}
                </>
              )}
              <QuickLink
                href={`/list/results?studentId=${student.id}`}
                icon={ScrollText}
                label="Results"
                colorClass="bg-purple-500 text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: Fee Management (Full Width) ================= */}
      <div className={`${cardClass} p-6 flex flex-col gap-4 w-full`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={20} />
            Fee Overview
          </h3>
          <span
            className={`text-xs font-bold px-2 py-1 rounded border uppercase ${
              mode === "collect"
                ? "bg-green-50 text-green-700 border-green-200"
                : mode === "cancel"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {mode} Mode
          </span>
        </div>

        {/* Full Width Table Container */}
        <div className="w-full overflow-x-auto">
          <FeesTableContainer
            studentId={student.id}
            mode={mode as any}
            role={role as "admin" | "student"}
            studentName={student.name}
            studentEmail={student.email || ""}
            studentMobile={student.phone}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentFeePage;
