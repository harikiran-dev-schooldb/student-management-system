import AttendanceCalendar from "@/components/AttendanceCalendar";
import prisma from "@/lib/prisma";
import { SingleStudentSelect } from "../../../../../../../types/query-types";
import { notFound } from "next/navigation";
import { 
  UserCheck, 
  UserX, 
  PieChart, 
  CalendarDays, 
  TrendingUp 
} from "lucide-react";

interface StudentAttendancePageProps {
  params: Promise<{ id: string }>;
}

/* --- Styles & Tokens --- */
const cardClass = 
  "bg-white dark:bg-[#121727] rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden p-6 transition-all hover:shadow-md";

export default async function AttendancePage({
  params,
}: StudentAttendancePageProps) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  /* ================= CALCULATIONS ================= */
  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter((a) => a.present).length;
  const absentDays = student.attendances.filter((a) => !a.present).length;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto min-h-screen bg-white dark:bg-darkMode">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-indigo-600 dark:text-indigo-400" size={28} />
            Attendance Record
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed tracking for <span className="font-semibold text-gray-700 dark:text-gray-200">{student.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm bg-white dark:bg-[#121727] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Class</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">{student.Class.Grade.level} - {student.Class.section}</span>
           </div>
           <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Student ID</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">#{student.id}</span>
           </div>
        </div>
      </div>

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Present Card */}
        <StatCard 
          title="Days Present" 
          value={presentDays} 
          icon={UserCheck}
          theme="emerald"
          subtext="On time arrival"
        />

        {/* Absent Card */}
        <StatCard 
          title="Days Absent" 
          value={absentDays} 
          icon={UserX}
          theme="rose"
          subtext="Missed classes"
        />

        {/* Percentage Card (With Progress Bar) */}
        <div className={`${cardClass} relative`}>
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Rate</p>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{attendancePercent}%</h3>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                 <PieChart size={24} />
              </div>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  attendancePercent >= 75 ? 'bg-emerald-500' : 
                  attendancePercent >= 50 ? 'bg-yellow-500' : 'bg-rose-500'
                }`} 
                style={{ width: `${attendancePercent}%` }}
              ></div>
           </div>
           <p className="text-xs text-gray-400">Target: 75% required</p>
        </div>

      </div>

      {/* ================= CALENDAR SECTION ================= */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
           <TrendingUp size={20} className="text-gray-400" />
           Monthly Overview
        </h2>
        <div className={`${cardClass} p-0 overflow-hidden`}>
           {/* You can add a header inside the card if needed, or rely on the calendar's internal header */}
           <div className="p-6">
              <AttendanceCalendar
                attendanceData={student.attendances.map((a) => ({
                  date: a.date,
                  present: a.present,
                }))}
              />
           </div>
        </div>
      </div>

    </div>
  );
}

/* ================= UI HELPER COMPONENTS ================= */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  theme: "emerald" | "rose";
  subtext: string;
}

function StatCard({ title, value, icon: Icon, theme, subtext }: StatCardProps) {
  // Styles based on theme
  const themeStyles = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-800/30"
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-800/30"
    }
  };

  const t = themeStyles[theme];

  return (
    <div className={`${cardClass} border-l-4 ${theme === 'emerald' ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
      <div className="flex items-start justify-between">
        <div>
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
           <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
           <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${t.bg} ${t.text}`}>
           <Icon size={24} />
        </div>
      </div>
    </div>
  );
}