"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  LayoutGrid,
  CheckCircle2,
  Filter,
  Search,
  School,
  Maximize2,
  Minimize2,
  User,
  ChevronDown,
} from "lucide-react";

// --- Types ---
type Exam = { id: number; title: string };
type Grade = { id: number; level: string };
type Class = { id: number; section: string };
type Result = {
  id: number;
  marks: number;
  maxMarks: number;
  Student: { id: string; name: string };
  Subject: { id: number; name: string };
  Exam: { id: number; title: string };
};

// --- Interfaces ---
interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function ResultsViewer() {
  // --- State ---
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [selectedExamId, setSelectedExamId] = useState<number>();
  const [selectedGradeId, setSelectedGradeId] = useState<number>();
  const [selectedClassId, setSelectedClassId] = useState<number>();

  const [role, setRole] = useState<"student" | "teacher" | "admin">();
  const [studentId, setStudentId] = useState<string>();
  const [teacherClassId, setTeacherClassId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // --- Effects ---

  // 1. Initial Load (User & Exams)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const userRes = await axios.get("/api/users/me");
        const { role, studentId, classId } = userRes.data;

        if (!mounted) return;
        setRole(role);
        if (role === "student") setStudentId(studentId);
        if (role === "teacher") setTeacherClassId(Number(classId));

        // Parallel API calls
        const [examsRes, gradesRes] = await Promise.all([
          axios.get("/api/exams"),
          role === "admin"
            ? axios.get("/api/grades")
            : Promise.resolve({ data: [] }),
        ]);

        if (mounted) {
          setExams(examsRes.data.exams || []);
          if (role === "admin") setGrades(gradesRes.data || []);
        }

        if (role === "teacher" && classId && mounted) {
          const clsRes = await axios.get(`/api/classes?classId=${classId}`);
          setClasses(clsRes.data);
          setSelectedClassId(Number(classId));
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch classes when grade changes (Admin only)
  useEffect(() => {
    if (role !== "admin" || !selectedGradeId) return;
    axios
      .get(`/api/classes?gradeId=${selectedGradeId}`)
      .then((res) => setClasses(res.data));
  }, [selectedGradeId, role]);

  // 3. Main Search Function
  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedExamId) {
        setError("Please select an exam.");
        setLoading(false);
        return;
      }

      let params: any = { examId: selectedExamId };

      if (role === "student") params.studentId = studentId;
      else if (role === "teacher") {
        if (!teacherClassId) {
          setError("No class assigned.");
          setLoading(false);
          return;
        }
        params.classId = teacherClassId;
      } else if (role === "admin") {
        if (!selectedGradeId || !selectedClassId) {
          setError("Please select grade and class.");
          setLoading(false);
          return;
        }
        params.gradeId = selectedGradeId;
        params.classId = selectedClassId;
      }

      const res = await axios.get("/api/results", { params });
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  };

  // --- Data Processing ---
  const subjects = useMemo(
    () => Array.from(new Set(results.map((r) => r.Subject.name))).sort(),
    [results]
  );

  const studentMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; marks: Record<string, number> }
    >();
    results.forEach((r) => {
      if (!map.has(r.Student.id))
        map.set(r.Student.id, { name: r.Student.name, marks: {} });
      map.get(r.Student.id)!.marks[r.Subject.name] = r.marks;
    });
    return map;
  }, [results]);

  const studentRows = Array.from(studentMap.entries());

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // --- Helper to calculate totals ---
  const subjectMaxMap = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach((r) => {
      if (!map.has(r.Subject.name)) map.set(r.Subject.name, r.maxMarks);
    });
    return map;
  }, [results]);

  // --- UI ---
  return (
    <div
      className={`flex flex-col bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-all duration-300 ${
        isFullScreen
          ? "fixed inset-0 z-[100] h-screen w-screen"
          : "relative min-h-[calc(100vh-4rem)] w-full"
      }`}
    >
      {/* 1. Premium Header */}
      <header className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 top-0 z-30 shadow-sm px-4 md:px-6 py-4 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <School className="w-5 h-5" />
              </span>
              Results Viewer
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-14 font-medium">
              View performance reports & mark sheets.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all active:scale-95 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 w-full bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2">
          <SelectBox
            label="Exam"
            icon={<CheckCircle2 className="w-4 h-4" />}
            value={selectedExamId ?? ""}
            onChange={(e) => setSelectedExamId(Number(e.target.value))}
            placeholder="Select Exam"
            options={exams.map((e) => ({ value: e.id, label: e.title }))}
          />

          {role === "admin" && (
            <>
              <SelectBox
                label="Grade"
                icon={<Filter className="w-4 h-4" />}
                value={selectedGradeId ?? ""}
                onChange={(e) => {
                  setSelectedGradeId(Number(e.target.value));
                  setSelectedClassId(undefined);
                }}
                placeholder="Select Grade"
                options={grades.map((g) => ({ value: g.id, label: g.level }))}
              />
              <SelectBox
                label="Class"
                icon={<LayoutGrid className="w-4 h-4" />}
                value={selectedClassId ?? ""}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                placeholder="Select Class"
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.section,
                }))}
              />
            </>
          )}

          <button
            onClick={fetchResults}
            disabled={loading}
            className="w-full md:w-auto mt-2 md:mt-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Fetch</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 w-full p-4 md:p-6 overflow-hidden flex flex-col">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Generating Report...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50 mt-2 min-h-[300px]">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              No Results Found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm text-center text-sm">
              Adjust filters above to see student performance.
            </p>
          </div>
        )}

        {/* Results Table / Cards */}
        {!loading && results.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden mt-2 relative animate-in slide-in-from-bottom-4 duration-500">
            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs font-bold uppercase tracking-wider bg-zinc-50/95 dark:bg-[#18181b]/95 text-zinc-500 dark:text-zinc-400 sticky top-0 z-20 backdrop-blur-md shadow-sm">
                  <tr>
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 text-center w-16">
                      #
                    </th>
                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 text-left">
                      Student Details
                    </th>
                    {subjects.map((subj) => (
                      <th
                        key={subj}
                        className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 text-center min-w-[100px]"
                      >
                        {subj}
                      </th>
                    ))}
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                      Total
                    </th>
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {studentRows.map(([id, student], idx) => {
                    const total = subjects.reduce(
                      (sum, subj) => sum + (student.marks[subj] ?? 0),
                      0
                    );
                    const maxTotal = subjects.reduce(
                      (sum, subj) => sum + (subjectMaxMap.get(subj) ?? 0),
                      0
                    );
                    const percentage =
                      maxTotal > 0
                        ? ((total / maxTotal) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={id}
                        className="group hover:bg-LamaHover dark:hover:bg-indigo-500/5 transition-colors duration-150 border-b border-zinc-100 dark:border-zinc-800/50"
                      >
                        <td className="px-4 py-3 text-center text-zinc-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {student.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                              ID: {id}
                            </span>
                          </div>
                        </td>
                        {subjects.map((subj) => (
                          <td
                            key={subj}
                            className="px-4 py-3 text-center font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            {student.marks[subj] ?? (
                              <span className="text-zinc-300 dark:text-zinc-700">
                                -
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10">
                          {total}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                  {/* Max Marks Row */}
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider">
                    <td
                      colSpan={2}
                      className="px-6 py-3 text-right text-zinc-500 dark:text-zinc-400"
                    >
                      Max Marks
                    </td>
                    {subjects.map((subj) => (
                      <td
                        key={subj}
                        className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-300"
                      >
                        {subjectMaxMap.get(subj) ?? "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-100">
                      {subjects.reduce(
                        (sum, subj) => sum + (subjectMaxMap.get(subj) ?? 0),
                        0
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-100">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-4 space-y-4 bg-zinc-50 dark:bg-black/20">
              {studentRows.map(([id, student], idx) => {
                const total = subjects.reduce(
                  (sum, subj) => sum + (student.marks[subj] ?? 0),
                  0
                );
                const maxTotal = subjects.reduce(
                  (sum, subj) => sum + (subjectMaxMap.get(subj) ?? 0),
                  0
                );
                const percentage =
                  maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white">
                            {student.name}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            ID: {id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {percentage}%
                        </div>
                        <div className="text-xs text-zinc-400">
                          Total: {total}/{maxTotal}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {subjects.map((subj) => (
                        <div
                          key={subj}
                          className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                        >
                          <span className="text-zinc-500 dark:text-zinc-400 truncate pr-2">
                            {subj}
                          </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {student.marks[subj] ?? "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Modern Select Component ---
const SelectBox = ({
  label,
  options,
  placeholder,
  icon,
  ...props
}: SelectBoxProps) => (
  <div className="relative group flex-1">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
      {icon}
    </div>
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
      <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
    </div>
    <select
      className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-900 shadow-sm"
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
