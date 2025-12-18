// app/student/page.tsx
export const dynamic = "force-dynamic";

import Messages from "@/components/Announcements";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import EventCalendar from "@/components/EventCalendar";
import UnauthorizedReload from "@/components/UnauthorizedReload";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

const StudentPage = async () => {
  const { userId, role, students } = await fetchUserInfo();

  // 🔒 Only allow student role
  if (!userId || role !== "student") {
    return <UnauthorizedReload />;
  }

  // Students array should contain the active student
  const student = students?.[0] || null;
  if (!student) {
    return (
      <p className="text-center text-red-500">⚠️ No student data available.</p>
    );
  }

  // Fetch student with class relation
  const fullStudent = await prisma.student.findUnique({
    where: { id: student.studentId },
    select: {
      id: true,

      Class: {
        select: {
          id: true,
          name: true,
        },
      },

      attendances: {
        select: {
          date: true,
          present: true,
        },
      },
    },
  });

  if (!fullStudent?.Class) {
    return (
      <div className="flex flex-col gap-4 p-4 xl:flex-row">
        <div className="w-full xl:w-2/3">
          <div className="h-full p-4 bg-white rounded-md">
            <h1 className="text-xl font-semibold">Schedule</h1>
            <p>No schedule available for this student.</p>
          </div>
        </div>
        <div className="flex flex-col w-full gap-8 xl:w-1/3">
          <EventCalendar />
          <Messages />
        </div>
      </div>
    );
  }

  // ✅ Student has a class → render calendar
  return (
    <div className="flex flex-col gap-4 p-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="h-full p-4 bg-white dark:bg-gray-900 rounded-md">
          <h1 className="text-xl font-semibold">
            Time-Table ({fullStudent.Class.name})
            <ClassTimetableContainer classId={fullStudent.Class.id} />
          </h1>
        </div>
      </div>
      <div className="flex flex-col w-full gap-8 xl:w-1/3">
        <AttendanceCalendar
          attendanceData={fullStudent.attendances.map((a) => ({
            date: a.date,
            present: a.present, // true/false or null for holiday
          }))}
        />

        <Messages />
      </div>
    </div>
  );
};

export default StudentPage;
