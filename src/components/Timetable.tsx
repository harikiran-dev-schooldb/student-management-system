"use client";

import { useState } from "react";
import { PERIOD_TIMINGS } from "@/lib/utils/periods";

type Lesson = {
  day: string;
  period: keyof typeof PERIOD_TIMINGS | null;
  subject: string;
  teacher?: string;
  class: string | null;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

// Updated Palette with specific Dark Mode variants
// We use translucent backgrounds in dark mode for a premium "glass" feel
const SUBJECT_COLORS = [
  { 
    bg: "bg-sky-50 dark:bg-sky-900/20", 
    text: "text-sky-700 dark:text-sky-100", 
    border: "border-sky-400 dark:border-sky-600" 
  },
  { 
    bg: "bg-indigo-50 dark:bg-indigo-900/20", 
    text: "text-indigo-700 dark:text-indigo-100", 
    border: "border-indigo-400 dark:border-indigo-600" 
  },
  { 
    bg: "bg-yellow-50 dark:bg-yellow-900/20", 
    text: "text-yellow-700 dark:text-yellow-100", 
    border: "border-yellow-400 dark:border-yellow-600" 
  },
  { 
    bg: "bg-emerald-50 dark:bg-emerald-900/20", 
    text: "text-emerald-700 dark:text-emerald-100", 
    border: "border-emerald-400 dark:border-emerald-600" 
  },
  { 
    bg: "bg-rose-50 dark:bg-rose-900/20", 
    text: "text-rose-700 dark:text-rose-100", 
    border: "border-rose-400 dark:border-rose-600" 
  },
  { 
    bg: "bg-violet-50 dark:bg-violet-900/20", 
    text: "text-violet-700 dark:text-violet-100", 
    border: "border-violet-400 dark:border-violet-600" 
  },
];

export default function Timetable({ lessons }: { lessons: Lesson[] }) {
  // Mobile State: Which day is currently selected?
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  // Logic: Map subjects -> consistent colors
  // The type is simple string pointers now because the Tailwind classes contain the dark logic
  const subjectColorMap: Record<string, typeof SUBJECT_COLORS[0]> = {};
  let colorIndex = 0;
  lessons.forEach((l) => {
    if (!subjectColorMap[l.subject]) {
      subjectColorMap[l.subject] = SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length];
      colorIndex++;
    }
  });

  const periodKeys = Object.keys(PERIOD_TIMINGS) as (keyof typeof PERIOD_TIMINGS)[];

  // Helper to render a single lesson card (Used in both Mobile and Desktop)
  const renderLessonCard = (lesson: Lesson | undefined, isMobile = false) => {
    if (!lesson) {
      // Empty State - Dark mode colors updated
      return (
        <div className={`
          flex items-center justify-center rounded-2xl border-2 border-dashed 
          border-gray-100 dark:border-gray-800 
          bg-gray-50/50 dark:bg-gray-900/30 
          text-gray-300 dark:text-gray-600 font-medium text-xs cursor-default
          ${isMobile ? "h-24 w-full" : "h-full min-h-[100px]"}
        `}>
          Free Period
        </div>
      );
    }

    const color = subjectColorMap[lesson.subject] || SUBJECT_COLORS[0];
    return (
      <div className={`
        relative w-full rounded-2xl p-4 flex flex-col justify-between 
        transition-all duration-300 ease-out hover:shadow-lg dark:hover:shadow-gray-900/30 cursor-pointer
        border-l-[6px] ${color.border} ${color.bg}
        ${isMobile ? "shadow-sm dark:shadow-gray-900/10 mb-4" : "h-full min-h-[110px] hover:scale-[1.02]"}
      `}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-sm leading-tight ${color.text}`}>
            {lesson.subject}
          </h3>
        </div>
        <div className="space-y-1">
          {lesson.class && (
            <div className={`flex items-center gap-1.5 ${color.text} opacity-80 dark:opacity-90`}>
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               <span className="text-xs font-medium">{lesson.class}</span>
            </div>
          )}
          {lesson.teacher && (
            <div className={`flex items-center gap-1.5 ${color.text} opacity-80 dark:opacity-90`}>
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               <span className="text-xs font-medium">{lesson.teacher}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-darkMode min-h-screen font-sans transition-colors duration-300">
      
      {/* ================= MOBILE VIEW (Visible < md) ================= */}
      <div className="md:hidden">
        {/* Header */}
        <div className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Schedule</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Tap a day to view classes</p>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all
                  ${isSelected 
                    ? "bg-indigo-600 dark:bg-darkMode text-white shadow-md transform scale-105" 
                    : "bg-white dark:bg-darkMode text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}
                `}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>

        {/* Mobile Timeline */}
        <div className="space-y-6">
          {periodKeys.map((periodKey) => {
            const { start, end } = PERIOD_TIMINGS[periodKey];
            const isBreakOrLunch = periodKey.startsWith("BREAK") || periodKey === "LUNCH";
            const lesson = lessons.find((l) => l.day === selectedDay && l.period === periodKey);

            // Mobile Break View
            if (isBreakOrLunch) {
              return (
                <div key={periodKey} className="flex items-center gap-4 py-2 opacity-70">
                   <div className="w-16 text-xs text-right text-gray-400 dark:text-gray-500 font-mono">{start}</div>
                   <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-800 relative">
                      <span className="absolute top-[-10px] left-2 bg-gray-50 dark:bg-darkMode px-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                         {periodKey === "LUNCH" ? "🍱 Lunch" : "☕ Break"}
                      </span>
                   </div>
                </div>
              );
            }

            // Mobile Lesson View
            return (
              <div key={periodKey} className="flex gap-4">
                 {/* Time Column */}
                 <div className="w-16 flex flex-col items-end pt-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{start}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{end}</span>
                 </div>
                 
                 {/* Card Column */}
                 <div className="flex-1">
                    {renderLessonCard(lesson, true)}
                 </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ================= DESKTOP VIEW (Visible >= md) ================= */}
      <div className="hidden md:block overflow-x-auto rounded-3xl shadow-xl dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkMode transition-colors duration-300">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="p-4 text-left min-w-[120px]">
                 <span className="text-xl font-bold text-gray-800 dark:text-gray-100 block">Schedule</span>
                 <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Weekly View</span>
              </th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 min-w-[140px]">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">{day.substring(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodKeys.map((periodKey) => {
              const { start, end } = PERIOD_TIMINGS[periodKey];
              const isBreakOrLunch = periodKey.startsWith("BREAK") || periodKey === "LUNCH";

              // Desktop Break View
              if (isBreakOrLunch) {
                return (
                  <tr key={periodKey}>
                    <td colSpan={DAYS.length + 1} className="py-4">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dashed border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative bg-white dark:bg-darkMode px-4 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                          {periodKey === "LUNCH" ? "🍱 Lunch Break" : "☕ Break"} <span className="text-xs text-gray-400 dark:text-gray-500">({start} - {end})</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              // Desktop Lesson View
              return (
                <tr key={periodKey}>
                  {/* Time Slot Column */}
                  <td className="align-top p-2">
                    <div className="flex flex-col items-center justify-center h-full p-3 rounded-xl bg-gray-50 dark:bg-darkMode border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{periodKey.replace("PERIOD", "P")}</span>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{start}</div>
                      <div className="w-[1px] h-3 bg-gray-300 dark:bg-darkMode my-1"></div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{end}</div>
                    </div>
                  </td>
                  {/* Lesson Cards */}
                  {DAYS.map((day) => {
                    const lesson = lessons.find((l) => l.day === day && l.period === periodKey);
                    return (
                      <td key={`${day}-${periodKey}`} className="p-1 h-full">
                        {renderLessonCard(lesson, false)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}