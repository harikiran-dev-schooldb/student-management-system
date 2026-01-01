import Messages from "@/components/Announcements";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { SingleStudentSelect } from "../../../../types/query-types";

/* --- Styles & Tokens --- */
const cardClass =
  "bg-white dark:bg-darkMode rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md";

const ProfilePage = async () => {
  const { userId } = await fetchUserInfo();


  // Find the student in Prisma by linked user id
  const student = await prisma.student.findFirst({
    where: { linkedUserId: userId },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 xl:flex-row bg-gray-50/50 dark:bg-darkMode min-h-screen">
      {/* ================= LEFT COLUMN (Profile, Metrics, Schedule) ================= */}
      <div className="w-full xl:w-3/4 space-y-6">
        {/* 2. TIMETABLE SECTION */}
        <div className={`${cardClass} p-2`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Weekly Schedule (Class {student.Class.name})
            </h3>
          </div>
          <ClassTimetableContainer classId={student.Class.id} />
        </div>
      </div>

      {/* ================= RIGHT COLUMN (Calendar, Messages) ================= */}
      <div className="w-full xl:w-1/4 space-y-6">
        {/* Announcements/Messages Widget */}
        <div className={`${cardClass} p-5`}>
          <Messages />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
