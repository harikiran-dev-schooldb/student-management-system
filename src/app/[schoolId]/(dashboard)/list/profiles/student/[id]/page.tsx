import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import Avatar from "@/components/Avatar";

// Icons
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  ShieldCheck,
  BookOpen,
  Users,
  GraduationCap,
  Activity,
  Layers,
} from "lucide-react";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { SingleStudentSelect } from "../../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

interface StudentSinglePageProps {
  params: Promise<{ schoolId: string; id: string }>;
}

const StudentProfilePage = async ({ params }: StudentSinglePageProps) => {
  const { schoolId: slug, id } = await params;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) notFound();

  const { role, studentId } = await fetchUserInfo(slug);

  // Only students can view their own profile
  if (role !== "student") {
    redirect("/logout");
  }

  const db = tenantPrisma(school.id);

  const student = await db.student.findFirst({
    where: { id },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  const classStudentCount = await db.student.count({
    where: {
      classId: student.classId,
      status: "ACTIVE", // optional but recommended
    },
  });

  if (role === "student" && studentId !== id) {
    return notFound();
  }

  // Helper to format dates consistently
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not provided";
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
      new Date(date),
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 bg-gray-50/50 dark:bg-darkMode min-h-screen">
      {/* === PAGE HEADER === */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View academic status and personal details
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider">
          Student
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* === LEFT COLUMN (Profile & Personal Info) === */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          {/* 1. HERO CARD (Gradient Style) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            {/* Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

            <div className="px-6 pb-6 relative">
              {/* Avatar & Name Group */}
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                <div className="relative">
                  <Avatar
                    src={student.img}
                    name={student.name}
                    gender={student.gender}
                    size={112} // 28 * 4
                    className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-md bg-white dark:bg-gray-800"
                  />
                  <div
                    className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900"
                    title="Active"
                  ></div>
                </div>

                <div className="flex-1 pt-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {student.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      ID: {student.id}
                    </span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-700">
                      •
                    </span>
                    <span className="capitalize">{student.gender}</span>
                  </p>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                <InfoItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={student.email}
                />
                <InfoItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={student.phone}
                />
                <InfoItem
                  icon={<Calendar size={18} />}
                  label="Date of Birth"
                  value={formatDate(student.dob)}
                />
                <InfoItem
                  icon={<Droplet size={18} />}
                  label="Blood Type"
                  value={student.bloodType}
                />
                <InfoItem
                  icon={<User size={18} />}
                  label="Parent Name"
                  value={student.fatherName}
                />
                <InfoItem
                  icon={<ShieldCheck size={18} />}
                  label="System Role"
                  value="Student"
                />
              </div>
            </div>
          </div>

          {/* 2. ACADEMIC OVERVIEW (Styled like 'Account Security') */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Academic Overview
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Grade"
                value={student.Class.Grade.level}
                icon={<GraduationCap size={20} />}
                colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              />
              <StatCard
                label="Class"
                value={student.Class.section}
                icon={<Layers size={20} />}
                colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              />
              <StatCard
                label="Lessons"
                value={student.Class._count.lessons.toString()}
                icon={<BookOpen size={20} />}
                colorClass="bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
              />
              <StatCard
                label="Attendance"
                value={<span className="text-xs">View Chart</span>}
                icon={<Activity size={20} />}
                colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              />
            </div>

            {/* Attendance Graph Container */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Attendance Performance
              </h4>
              <div className="h-64 w-full">
                <Suspense
                  fallback={
                    <div className="h-full w-full bg-gray-50 dark:bg-gray-800 rounded animate-pulse" />
                  }
                >
                  <StudentAttendanceCard id={student.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Announcements & Extras) === */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* CLASS INFO MINI CARD */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Class Information
            </h3>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {/* Class Name */}
                <span className="text-gray-500 dark:text-gray-400">
                  Class Name
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {student.Class.name}
                </span>

                {/* Class Teacher */}
                <span className="text-gray-500 dark:text-gray-400">
                  Class Teacher
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {student.Class.Teacher?.name || "Not assigned"}
                </span>

                {/* Capacity / Strength */}
                <span className="text-gray-500 dark:text-gray-400">
                  Class Strength
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {classStudentCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */

// 1. Info Item
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 shrink-0">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate"
        title={value || ""}
      >
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

// 2. Stat Card (For Academic Overview)
const StatCard = ({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  colorClass: string;
}) => (
  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
    <div className={`p-2 rounded-full mb-3 ${colorClass}`}>{icon}</div>
    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{value}</h4>
    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
      {label}
    </span>
  </div>
);

export default StudentProfilePage;
