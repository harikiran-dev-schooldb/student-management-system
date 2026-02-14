"use client";

import { usePathname } from "next/navigation";

const Loading = () => {
  const pathname = usePathname();

  // Map of path keywords to loading messages
  const pathMessages: { [key: string]: string } = {
    students: "Students Loading...",
    teachers: "Teachers Loading...",
    classes: "Classes Loading...",
    admin: "Dashboard Loading...",
    attendance: "Attendance Loading...",
    homeworks: "Homeworks Loading...",
    fees: "Fees List Loading...",
    subjects: "Subjects Loading...",
    lessons: "Lessons Loading...",
    exams: "Exams Loading...",
    results: "Results Loading...",
    events: "Events Loading...",
    announcements: "Announcements Loading...",
  };

  // Find the first path match
  const matched = Object.entries(pathMessages).find(([key]) =>
    pathname.includes(`/${key}`)
  );

  const message = matched ? matched[1] : "Loading...";

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 transition-opacity animate-fadeIn">
      <div className="w-12 h-12 border-4 border-gray-300 rounded-full border-t-LamaBlue animate-spin"></div>
      <div className="text-lg font-semibold text-gray-700">{message}</div>
    </div>
  );
};

export default Loading;
