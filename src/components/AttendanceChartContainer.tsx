import AttendanceChart from "./AttendanceChart";

interface AttendanceRecord {
  date: string;    // YYYY-MM-DD
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
    console.error("Invalid records data");
    return <div>No attendance records available.</div>; // Fallback UI
  }
  
  // Dates that actually exist in DB (attendance marked)
  const markedDateSet = new Set(records.map(r => r.date));

  // Map for present lookup
  const presentMap = new Map(records.map(r => [r.date, r.present]));

  const data: AttendanceChartData[] = [];

  // Generate last 7 days INCLUDING today
  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);

    // Skip Sunday
    if (dateObj.getDay() === 0) continue;

    const dateStr = dateObj.toISOString().split("T")[0];
    const attendanceMarked = markedDateSet.has(dateStr);
    const present = presentMap.get(dateStr) ?? 0;

    data.push({
      name: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
      present: attendanceMarked ? present : 0,
      absent: attendanceMarked
        ? Math.max(totalStudents - present, 0)
        : 0,
    });
  }

  return (
    <div className="h-full p-4 bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-gray-500 dark:text-gray-300">
          Attendance (Last 7 Days)
        </h1>
        <img src="/moreDark.png" alt="More" width={20} height={20} />
      </div>

      <AttendanceChart data={data} darkMode />
    </div>
  );
};

export default AttendanceChartContainer;
