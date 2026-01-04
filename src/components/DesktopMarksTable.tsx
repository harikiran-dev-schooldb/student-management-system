"use client";

import { UserCircle2 } from "lucide-react";

type StudentLite = {
  id: string;
  name: string;
};

type SubjectLite = {
  id: number;
  name: string;
};

type MarksData = {
  studentId: string;
  marks: Record<string, string>;
};

interface Props {
  students: StudentLite[];
  subjects: SubjectLite[];
  marksData: MarksData[];
  onChange: (studentId: string, subject: string, value: string) => void;
}

const DesktopMarksTable = ({
  students,
  subjects,
  marksData,
  onChange,
}: Props) => {
  const marksMap: Record<string, Record<string, string>> =
    Object.fromEntries(marksData.map((m) => [m.studentId, m.marks]));

  return (
    <div className="overflow-auto custom-scrollbar w-full h-full relative">
      <table className="min-w-full border-collapse text-sm">
        {/* Table Header */}
        <thead className="sticky top-0 z-30 bg-zinc-50 dark:bg-darkMode shadow-sm">
          <tr>
            <th className="sticky left-0 z-40 w-64 px-6 py-4 bg-zinc-50 dark:bg-darkMode text-left font-semibold text-zinc-600 dark:text-zinc-300 border-b border-r border-zinc-200 dark:border-darkfg">
              Student Details
            </th>
            {subjects.map((s) => (
              <th
                key={s.id}
                className="px-4 py-4 text-center min-w-[120px] font-semibold text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-darkfg"
              >
                {s.name}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white dark:bg-darkMode divide-y divide-zinc-100 dark:divide-zinc-800">
          {students.map((student) => (
            <tr
              key={student.id}
              className="group hover:bg-zinc-50 dark:hover:bg-darkMode/50 transition-colors"
            >
              {/* Sticky Student Name Column */}
              <td className="sticky left-0 z-20 bg-white dark:bg-darkMode group-hover:bg-zinc-50 dark:group-hover:bg-darkMode/50 px-6 py-3 border-r border-zinc-200 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">
                        {student.name}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      ID: {student.id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </td>

              {/* Marks Inputs */}
              {subjects.map((s) => {
                const value = marksMap[student.id]?.[s.name] ?? "";

                return (
                  <td key={s.id} className="p-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={value}
                      placeholder="-"
                      onChange={(e) =>
                        onChange(student.id, s.name, e.target.value)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="
                        w-full h-10 text-center rounded-lg 
                        border border-transparent bg-zinc-50 dark:bg-darkMode
                        text-zinc-900 dark:text-white font-medium
                        placeholder-zinc-300 dark:placeholder-zinc-600
                        focus:bg-white dark:focus:bg-black
                        focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
                        transition-all duration-200 outline-none
                        hover:bg-zinc-100 dark:hover:bg-darkfg
                      "
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopMarksTable;