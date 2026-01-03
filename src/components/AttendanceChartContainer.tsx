import { MoreHorizontal, TrendingUp, CalendarDays } from "lucide-react";
import AttendanceChart from "./AttendanceChart";

interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  present: number; // aggregated
}

interface AttendanceChartData {
  name: string;
  present: number;
  absent: number;
}

interface AttendanceChartContainerProps {
  records: AttendanceRecord[];
  totalStudents: number;
}

const AttendanceChartContainer = ({
  records,
  totalStudents,
}: AttendanceChartContainerProps) => {
  if (!records || !Array.isArray(records)) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-white p-4 text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-400">
        No attendance records available.
      </div>
    );
  }

  // --- Logic Section ---
  const markedDateSet = new Set(records.map((r) => r.date));
  const presentMap = new Map(records.map((r) => [r.date, r.present]));

  const data: AttendanceChartData[] = [];
  let totalPresentCount = 0;
  let daysCounted = 0;

  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);

    // Skip Sunday
    if (dateObj.getDay() === 0) continue;

    const dateStr = dateObj.toISOString().split("T")[0];
    const attendanceMarked = markedDateSet.has(dateStr);
    const present = presentMap.get(dateStr) ?? 0;

    // Calculate Summary Stats (Only for days where data exists)
    if (attendanceMarked) {
      totalPresentCount += present;
      daysCounted++;
    }

    data.push({
      name: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
      present: attendanceMarked ? present : 0,
      absent: attendanceMarked ? Math.max(totalStudents - present, 0) : 0,
    });
  }

  // Calculate Average Percentage for the badge
  const averagePercentage =
    daysCounted > 0 && totalStudents > 0
      ? Math.round((totalPresentCount / (daysCounted * totalStudents)) * 100)
      : 0;

  // --- UI Section ---
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-darkMode">
      {/* Header Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
            <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Weekly Attendance
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
            Last 7 Days (Excl. Sun)
          </p>
        </div>

        {/* Indigo Themed Badge */}
        <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 border border-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-900/20">
          <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {averagePercentage}% Avg
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-full w-full flex-1">
        <AttendanceChart data={data} darkMode />
      </div>
    </div>
  );
};

export default AttendanceChartContainer;