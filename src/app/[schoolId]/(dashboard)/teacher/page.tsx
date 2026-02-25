export const dynamic = "force-dynamic";

import Messages from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { redirect, notFound } from "next/navigation";
import { AlertCircle, CalendarClock, CalendarDays, Megaphone } from "lucide-react";

interface PageProps {
  params: Promise<{ schoolId: string }>;
}

/* --- UI Tokens --- */ const cardClass =
  "bg-white dark:bg-darkMode rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden p-6 transition-all hover:shadow-md";

const TeacherPage = async ({ params }: PageProps) => {
  // 1️⃣ Resolve slug
  const { schoolId: slug } = await params;

  // 2️⃣ Resolve internal school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) return notFound();

  // 3️⃣ Tenant scoped DB
  const db = tenantPrisma(school.id);

  // 4️⃣ Fetch user scoped to this school
  const { userId, role, teacherId } = await fetchUserInfo(slug);

  // 🔒 No session
  if (!userId) {
    redirect(`/${slug}/logout`);
  }

  // 🔁 Role routing
  if (role === "admin") {
    redirect(`/${slug}/admin`);
  }

  // 🔒 Only teacher allowed
  if (role !== "teacher" || !teacherId) {
    redirect(`/${slug}/logout`);
  }

  // 5️⃣ Fetch teacher safely
  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    include: { class: true },
  });

  if (!teacher) {
    redirect(`/${slug}/logout`);
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50 dark:bg-darkbg">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarClock
            className="text-indigo-600 dark:text-indigo-400"
            size={28}
          />
          Teacher Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back,{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {teacher.name}
          </span>
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ================= LEFT: SCHEDULE ================= */}
        <div className="w-full xl:w-2/3">
          <div className={`${cardClass} h-full`}>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                My Schedule
              </h2>
              {teacher.class && (
                <span className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">
                  Class Teacher: {teacher.class.name}
                </span>
              )}
            </div>

            {teacher.id ? (
              <TeacherTimetableContainer teacherId={teacher.id} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                  <AlertCircle size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No schedule available
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Contact admin if this is an error.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <div className="flex flex-col w-full xl:w-1/3 gap-6">
          {/* Calendar Widget */}
          <div className={cardClass}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDays className="text-rose-500" size={20} />
              Upcoming Events
            </h3>
            <EventCalendar />
          </div>

          {/* Announcements Widget */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Megaphone className="text-emerald-500" size={20} />
                Announcements
              </h3>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                View All
              </button>
            </div>
            <Messages />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
