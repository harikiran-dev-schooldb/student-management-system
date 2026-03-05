import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import FormContainer from "@/components/FormContainer";
import Messages from "@/components/Announcements";
import Avatar from "@/components/Avatar";

// Icons
import {
  Mail,
  Phone,
  Calendar,
  Droplet,
  MapPin,
  BookOpen,
  Users,
  GraduationCap,
  CalendarDays,
  LayoutDashboard,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { tenantPrisma } from "@/lib/tenant-prisma";

interface TeacherSinglePageProps {
  params: Promise<{ schoolId: string; id: string }>;
}

const TeacherProfilePage = async ({ params }: TeacherSinglePageProps) => {
  const { schoolId: slug, id } = await params;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) notFound();

  const { role, teacherId } = await fetchUserInfo(slug);

  const db = tenantPrisma(school.id);

  // 🔐 Role-based access control
  if (role === "student" || (role === "teacher" && teacherId !== id)) {
    notFound();
  }

  // Fetch Teacher Data with Relations
  const teacher = await db.teacher.findUnique({
    where: { id },
    include: {
      teacherClassAssignments: {
        include: {
          class: {
            include: {
              Grade: true,
              _count: {
                select: {
                  lessons: true,
                  studentEnrollments: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          subjects: true,
          lessons: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  // Helper: Format Dates
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not provided";
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
      new Date(date),
    );
  };

  const classData = teacher.teacherClassAssignments[0]?.class;

  const totalStudents = classData?._count?.studentEnrollments ?? 0;

  const classId = classData?.id;

  const className = classData ? `${classData.name}` : "N/A"

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 bg-gray-50/50 dark:bg-darkMode min-h-screen">
      {/* === PAGE HEADER === */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teacher Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage staff details and academic schedules
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider">
          Teacher
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* === LEFT COLUMN (Profile & Stats) === */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          {/* 1. HERO CARD (Gradient Style) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors relative group">
            {/* Edit Button (Absolute Top Right) */}
            {role === "admin" && (
              <div className="absolute top-4 right-4 z-10">
                <FormContainer table="teacher" type="update" data={teacher} />
              </div>
            )}

            {/* Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>

            <div className="px-6 pb-6 relative">
              {/* Avatar & Name Group */}
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                <div className="relative">
                  <Avatar
                    src={teacher.img}
                    name={teacher.name}
                    gender={teacher.gender}
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
                    {teacher.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      ID: {teacher.id}
                    </span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-700">
                      •
                    </span>
                    <span className="capitalize">{teacher.gender}</span>
                    {classData && (
                      <>
                        <span className="hidden md:inline text-gray-300 dark:text-gray-700">
                          •
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                <InfoItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={teacher.email}
                />
                <InfoItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={teacher.phone}
                />
                <InfoItem
                  icon={<Calendar size={18} />}
                  label="Date of Birth"
                  value={formatDate(teacher.dob)}
                />
                <InfoItem
                  icon={<Droplet size={18} />}
                  label="Blood Type"
                  value={teacher.bloodType}
                />
                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={teacher.address}
                />
                <InfoItem
                  icon={<Users size={18} />}
                  label="Role"
                  value="Teacher"
                />
              </div>
            </div>
          </div>

          {/* 2. ACADEMIC STATS GRID */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Academic Performance
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Class"
                value={className || "N/A"}
                icon={<GraduationCap size={20} />}
                colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              />
              <StatCard
                label="Students"
                value={totalStudents.toString()}
                icon={<Users size={20} />}
                colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              />
              <StatCard
                label="Subjects"
                value={teacher._count.subjects.toString()}
                icon={<BookOpen size={20} />}
                colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              />
              <StatCard
                label="Lessons"
                value={teacher._count.lessons.toString()}
                icon={<CalendarDays size={20} />}
                colorClass="bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
              />
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Shortcuts & Messages) === */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Quick Actions
            </h3>

            <div className="flex flex-col gap-3">
              <ShortcutButton
                href={`/list/users/students?classId=${classId}`}
                label="View My Students"
                icon={<Users size={18} />}
                disabled={!classId}
              />
              <ShortcutButton
                href={`/list/lessons?teacherId=${teacher.id}`}
                label="View My Lessons"
                icon={<BookOpen size={18} />}
              />
              <ShortcutButton
                href={`/list/assignments?teacherId=${teacher.id}`}
                label="Assignments"
                icon={<LayoutDashboard size={18} />}
              />
              <ShortcutButton
                href={`/list/teachers/${teacher.id}/assignments`}
                label="Subject Mapping"
                icon={<GraduationCap size={18} />}
              />
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Announcements
            </h3>
            <Messages />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= UI HELPER COMPONENTS ================= */

// 1. Info Item Row
const InfoItem = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div
      className={`p-2.5 rounded-full shrink-0 ${highlight
        ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
        }`}
    >
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm font-medium truncate ${highlight
          ? "text-purple-700 dark:text-purple-300"
          : "text-gray-700 dark:text-gray-200"
          }`}
        title={value || ""}
      >
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

// 2. Stat Card
const StatCard = ({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: string;
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

// 3. Shortcut Button
const ShortcutButton = ({
  href,
  label,
  icon,
  disabled,
}: {
  href: string;
  label: string;
  icon: any;
  disabled?: boolean;
}) =>
  disabled ? (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <span className="text-sm font-medium text-gray-400">{label}</span>
      </div>
    </div>
  ) : (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:bg-purple-50 hover:border-purple-100 dark:hover:bg-purple-900/10 dark:hover:border-purple-900/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
          {label}
        </span>
      </div>
      <ArrowRight
        size={16}
        className="text-gray-300 dark:text-gray-600 group-hover:text-purple-400 transition-colors"
      />
    </Link>
  );

export default TeacherProfilePage;
