"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(new Date());

  // --- Normalize date to YYYY-MM-DD (UTC safe)
  const formatDate = (date: Date | string) =>
    new Date(date).toISOString().split("T")[0];

  // --- Build lookup map
  const tileClassNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    // Mark actual attendance records
    attendanceData.forEach((att) => {
      const day = formatDate(att.date);

      if (att.present === true) map[day] = "present-day";
      else if (att.present === false) map[day] = "absent-day";
      else map[day] = "holiday-day";
    });

    // Fill missing past weekdays in active month as holiday
    const today = new Date();
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const key = formatDate(date);

      // Only mark strictly past days (not today)
      if (
        date < today &&
        !map[key] &&
        date.getDay() !== 0 // exclude Sundays
      ) {
        map[key] = "holiday-day";
      }
    }

    return map;
  }, [attendanceData, activeDate]);

  const handleChange = (value: Value) => {
    if (value instanceof Date) setSelectedDate(value);
  };

  return (
    <div className="space-y-4">
      <Calendar
        onChange={handleChange}
        value={selectedDate instanceof Date ? selectedDate : new Date()}
        locale="en-GB"
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setActiveDate(activeStartDate);
        }}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const key = formatDate(date);
            return tileClassNameMap[key] || "";
          }
          return "";
        }}
      />

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 dark:text-gray-300">
        <Legend color="bg-emerald-500/80 ring-emerald-600/30" label="Present" />
        <Legend color="bg-rose-500/80 ring-rose-600/30" label="Absent" />
        <Legend color="bg-slate-400/70 ring-slate-500/30" label="Holiday" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <span
      className={`w-4 h-4 rounded-full ring-1 ${color}`}
    />
    <span>{label}</span>
  </div>
);

export default AttendanceCalendar;