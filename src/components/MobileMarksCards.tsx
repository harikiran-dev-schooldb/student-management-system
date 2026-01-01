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

const MobileMarksCards = ({
  students,
  subjects,
  marksData,
  onChange,
}: Props) => {
  const marksMap: Record<string, Record<string, string>> =
    Object.fromEntries(marksData.map((m) => [m.studentId, m.marks]));

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
        >
          {/* Student Header */}
          <div className="flex items-center gap-3 mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                <UserCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">
                {student.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                ID: {student.id.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Marks Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {subjects.map((s) => {
              const value = marksMap[student.id]?.[s.name] ?? "";

              return (
                <div key={s.id} className="relative group">
                  <label className="absolute -top-2.5 left-2 px-1 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-500 dark:text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    {s.name}
                  </label>

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
                      w-full h-12 px-3 pt-1 rounded-xl text-lg font-medium
                      border border-zinc-200 dark:border-zinc-700
                      bg-transparent
                      text-zinc-900 dark:text-white
                      focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
                      transition-all
                      placeholder-zinc-300 dark:placeholder-zinc-600
                    "
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileMarksCards;