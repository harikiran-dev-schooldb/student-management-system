"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Attendance {
  date: string | Date;
  present: boolean | null; // null → holiday
}

interface Props {
  attendanceData: Attendance[];
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AttendanceCalendar = ({ attendanceData }: Props) => {
  const [value, setValue] = useState<Value>(new Date());
  const [tileClassNameMap, setTileClassNameMap] = useState<{
    [key: string]: string;
  }>({});

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const map: { [key: string]: string } = {};

    // First, mark given attendance data
    attendanceData.forEach((att) => {
      const day = formatDate(att.date);
      if (att.present === true) map[day] = "present-day";
      else if (att.present === false) map[day] = "absent-day";
      else map[day] = "holiday-day"; // null → holiday
    });

    // Mark missing records till today as Holiday (excluding Sundays)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Loop all days of current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const key = formatDate(date);

      // only mark till today
      if (date <= today && !map[key] && date.getDay() !== 0) {
        map[key] = "holiday-day"; // treat missing attendance as holiday
      }
    }

    setTileClassNameMap(map);
  }, [attendanceData]);

  const handleChange = (newValue: Value) => {
    if (newValue instanceof Date) setValue(newValue);
  };

  return (
    <div className="space-y-4">
      <Calendar
        onChange={handleChange}
        value={value instanceof Date ? value : new Date()}
        locale="en-GB"
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const day = formatDate(date);
            return tileClassNameMap[day] || "";
          }
          return "";
        }}
      />

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-500/80 ring-1 ring-emerald-600/30"></span>
          <span>Present</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-rose-500/80 ring-1 ring-rose-600/30"></span>
          <span>Absent</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-slate-400/70 ring-1 ring-slate-500/30"></span>
          <span>Holiday</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
