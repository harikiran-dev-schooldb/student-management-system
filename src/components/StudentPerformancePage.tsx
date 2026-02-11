"use client";

import { useEffect, useMemo, useState } from "react";
import type { Grade, Class, Student } from "@prisma/client";
import {
  Search,
  Users,
  Filter,
  BarChart3,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface SubjectPerformance {
  subject: string;
  percentage: number;
  obtained: number;
  max: number;
}

interface StudentPerformance {
  student: Student;
  overallPercentage: number;
  attendancePercentage: number;
  grade: string;
  subjects: SubjectPerformance[];
  atRisk: boolean;
}

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

export default function StudentPerformancePage({
  role,
  teacherClassId,
}: Props) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(
    role === "teacher" ? teacherClassId ?? null : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Filters ---------------- */
  useEffect(() => {
    if (role === "admin") {
      fetch("/api/grades").then(r => r.json()).then(setGrades);
    }
  }, [role]);

  useEffect(() => {
    if (selectedGrade) {
      fetch(`/api/classes?gradeId=${selectedGrade}`)
        .then(r => r.json())
        .then(setClasses);
    }
  }, [selectedGrade]);

  /* ---------------- Fetch Performance ---------------- */
  const loadPerformance = async () => {
    setLoading(true);
    let url = "/api/student/analytics/student-performance";

    if (role === "teacher" && teacherClassId) {
      url += `?classId=${teacherClassId}`;
    } else if (selectedClass) {
      url += `?classId=${selectedClass}`;
    }

    const data = await fetch(url).then(r => r.json());
    setStudents(data);
    setLoading(false);
  };

  /* ---------------- Search Filter ---------------- */
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      s.student.name.toLowerCase().includes(q) ||
      s.student.id.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  /* ---------------- Styles ---------------- */
  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border bg-white dark:bg-darkfg border-slate-200 dark:border-slate-700 text-darkfg dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkMode p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-indigo-600" />
          Student Performance
        </h1>
        <p className="text-sm text-slate-500">
          Academic performance, attendance & subject-wise analysis
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-darkfg p-5 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {role === "admin" && (
            <>
              <div>
                <label className={labelClass}>Grade</label>
                <select
                  onChange={(e) => setSelectedGrade(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Class</label>
                <select
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.section}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex items-end">
            <button
              onClick={loadPerformance}
              className="w-full h-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              Load Data
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student..."
          className={`${inputClass} pl-9`}
        />
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStudents.map(({ student, overallPercentage, attendancePercentage, grade, subjects, atRisk }) => (
          <div
            key={student.id}
            className="bg-white dark:bg-darkfg p-5 rounded-xl border shadow-sm space-y-3"
          >
            {/* Student Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{student.name}</h3>
                <p className="text-xs text-slate-500">ID: {student.id}</p>
              </div>
              {atRisk && (
                <AlertTriangle className="text-rose-500" />
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500">Overall</p>
                <p className="font-bold">{overallPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Attendance</p>
                <p className="font-bold">{attendancePercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Grade</p>
                <p className="font-bold">{grade}</p>
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-1">
              {subjects.map(s => (
                <div key={s.subject} className="flex justify-between text-xs">
                  <span>{s.subject}</span>
                  <span className={s.percentage < 50 ? "text-rose-600" : "text-emerald-600"}>
                    {s.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <p className="text-center text-slate-500">
          No performance data available
        </p>
      )}
    </div>
  );
}
