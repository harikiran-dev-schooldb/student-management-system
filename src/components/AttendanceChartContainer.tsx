import Image from "next/image";
import AttendanceChart from "./AttendanceChart";

interface AttendanceRecord {
  date: Date;
  present: boolean;
}

interface AttendanceChartContainerProps {
  records: AttendanceRecord[];
}

const AttendanceChartContainer = ({ records }: AttendanceChartContainerProps) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const attendanceMap: Record<
    string,
    { present: number; absent: number }
  > = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
    Sat: { present: 0, absent: 0 },
  };

  records.forEach((item) => {
    const d = new Date(item.date);
    const index = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const day = daysOfWeek[index];

    if (!attendanceMap[day]) return;

    if (item.present) {
      attendanceMap[day].present += 1;
    } else {
      attendanceMap[day].absent += 1;
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <div className="h-full p-4 bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-500 dark:text-gray-300">
          Attendance
        </h1>
        <Image src="/moreDark.png" alt="More" width={20} height={20} />
      </div>

      <AttendanceChart data={data} darkMode />
    </div>
  );
};

export default AttendanceChartContainer;
