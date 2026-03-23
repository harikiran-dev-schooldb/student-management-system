"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  School,
  Maximize2,
  Minimize2,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";

// --- Types ---
type Exam = { id: number; title: string };
type Grade = { id: number; level: string };
type Class = { id: number; section: string };
type Result = {
  id: number;
  marks: number;
  maxMarks: number;
  student: { id: string; name: string; admissionNo: string; };
  subject: { id: number; name: string };
  Exam: { id: number; title: string };
};

interface CustomSelectProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
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

  const [studentId, setStudentId] = useState<string>();
  const [teacherClassId, setTeacherClassId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { schoolId } = useParams<{ schoolId: string }>();
  const [role, setRole] = useState<
    "student" | "teacher" | "admin" | undefined
  >();

  // --- Effects ---

  // 1. Initial Load (User & Exams)
  useEffect(() => {
    if (!schoolId) return;

    let mounted = true;

    const init = async () => {
      try {
        const user = await tenantFetch<{
          role: "student" | "teacher" | "admin";
          studentId?: string;
          classId?: number;
        }>(schoolId, "/users/me");

        if (!mounted) return;

        setRole(user.role);
        if (user.role === "student") setStudentId(user.studentId);
        if (user.role === "teacher") setTeacherClassId(user.classId);

        const [examsRes, gradesRes] = await Promise.all([
          tenantFetch<{ exams: Exam[] }>(schoolId, "/exams"),
          user.role === "admin"
            ? tenantFetch<Grade[]>(schoolId, "/grades")
            : Promise.resolve<Grade[]>([]),
        ]);

        if (!mounted) return;

        setExams(examsRes.exams || []);
        if (user.role === "admin") setGrades(gradesRes || []);

        if (user.role === "teacher" && user.classId) {
          const clsRes = await tenantFetch<any[]>(
            schoolId,
            `/classes?classId=${user.classId}`,
          );

          if (!mounted) return;

          setClasses(clsRes);
          setSelectedClassId(user.classId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [schoolId]);

  // 2. Fetch classes when grade changes (Admin only)
  useEffect(() => {
    if (!schoolId || role !== "admin" || !selectedGradeId) return;

    tenantFetch<any[]>(schoolId, `/classes?gradeId=${selectedGradeId}`)
      .then(setClasses)
      .catch(console.error);
  }, [selectedGradeId, role, schoolId]);

  // 3. Main Search Function
  const fetchResults = async () => {
    if (!schoolId) return;

    setLoading(true);
    setError(null);

    try {
      if (!selectedExamId) {
        setError("Please select an exam.");
        return;
      }

      const params: any = { examId: selectedExamId };

      if (role === "student") {
        params.studentId = studentId;
      } else if (role === "teacher") {
        if (!teacherClassId) {
          setError("No class assigned.");
          return;
        }
        params.classId = teacherClassId;
      } else if (role === "admin") {
        if (!selectedGradeId || !selectedClassId) {
          setError("Please select grade and class.");
          return;
        }
        params.gradeId = selectedGradeId;
        params.classId = selectedClassId;
      }

      const query = new URLSearchParams(params).toString();

      const res = await tenantFetch<{ results: Result[] }>(
        schoolId,
        `/results?${query}`,
      );

      setResults(res.results);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch results when all required filters are ready
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!selectedExamId) return;

    if (role === "admin" && (!selectedGradeId || !selectedClassId)) return;
    if (role === "teacher" && !teacherClassId) return;
    if (role === "student" && !studentId) return;

    if (hasFetchedRef.current) {
      fetchResults();
    } else {
      hasFetchedRef.current = true;
    }
  }, [
    selectedExamId,
    selectedGradeId,
    selectedClassId,
    role,
    teacherClassId,
    studentId,
  ]);

  // --- Data Processing ---
  const subjects = useMemo(
    () => Array.from(new Set(results.map((r) => r.subject.name))).sort(),
    [results],
  );

  const studentMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; admissionNo: string; marks: Record<string, number> }
    >();

    results.forEach((r) => {
      if (!map.has(r.student.id)) {
        map.set(r.student.id, {
          name: r.student.name,
          admissionNo: r.student.admissionNo || "",
          marks: {},
        });
      }

      const existing = map.get(r.student.id)!;

      // ✅ update admissionNo if missing
      if (!existing.admissionNo && r.student.admissionNo) {
        existing.admissionNo = r.student.admissionNo;
      }

      existing.marks[r.subject.name] = r.marks;
    });

    return map;
  }, [results]);

  const studentRows = Array.from(studentMap.entries());

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // --- Helper to calculate totals ---
  const subjectMaxMap = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach((r) => {
      if (!map.has(r.subject.name)) map.set(r.subject.name, r.maxMarks);
    });
    return map;
  }, [results]);

  // --- UI ---
  return (
    <div
      className={`flex flex-col bg-gray-50 dark:bg-darkMode text-zinc-900 dark:text-zinc-100 transition-all duration-300 ${isFullScreen
          ? "fixed inset-0 z-[100] h-screen w-screen"
          : "relative min-h-[calc(100vh-4rem)] w-full"
        }`}
    >
      {/* 1. Premium Header */}
      <header className="bg-white/80 dark:bg-darkMode backdrop-blur-xl border-b border-zinc-200 dark:border-darkfg top-0 z-30 shadow-sm px-4 md:px-6 py-4 transition-all">
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

          <div className="flex items-center gap-3">
            {/* Full Screen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-lg bg-white dark:bg-darkMode border border-zinc-200 dark:border-darkfg hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
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

        {/* Floating Filter Bar (same as Marks Entry) */}
        <div className="bg-white/70 dark:bg-darkMode backdrop-blur-xl border border-white/20 dark:border-darkfg p-1.5 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 grid grid-cols-1 md:grid-cols-3 gap-2">
          <CustomSelect
            label="Examination"
            icon={<BookOpen className="w-4 h-4" />}
            value={selectedExamId}
            onChange={(val) => setSelectedExamId(Number(val))}
            placeholder="Select Exam"
            options={exams.map((e) => ({ value: e.id, label: e.title }))}
          />

          {role === "admin" && (
            <>
              <CustomSelect
                label="Grade Level"
                icon={<GraduationCap className="w-4 h-4" />}
                value={selectedGradeId}
                onChange={(val) => {
                  setSelectedGradeId(Number(val));
                  setSelectedClassId(undefined);
                }}
                placeholder="Select Grade"
                options={grades.map((g) => ({ value: g.id, label: g.level }))}
              />

              <CustomSelect
                label="Class Section"
                icon={<Users className="w-4 h-4" />}
                value={selectedClassId}
                onChange={(val) => setSelectedClassId(Number(val))}
                placeholder="Select Section"
                disabled={!selectedGradeId}
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.section,
                }))}
              />
            </>
          )}
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
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-zinc-200 dark:border-darkfg rounded-3xl bg-white/50 dark:bg-zinc-900/50 mt-2 min-h-[300px]">
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
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-darkMode border border-zinc-200 dark:border-darkfg rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden mt-2 relative animate-in slide-in-from-bottom-4 duration-500">
            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs font-bold uppercase tracking-wider bg-zinc-50/95 dark:bg-darkMode text-zinc-500 dark:text-zinc-400 sticky top-0 z-20 backdrop-blur-md shadow-sm">
                  <tr>
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-darkfg text-center w-16">
                      #
                    </th>
                    <th className="px-6 py-4 border-b border-zinc-200 dark:border-darkfg text-left">
                      Student Details
                    </th>
                    {subjects.map((subj) => (
                      <th
                        key={subj}
                        className="px-4 py-4 border-b border-zinc-200 dark:border-darkfg text-center min-w-[100px]"
                      >
                        {subj}
                      </th>
                    ))}
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-darkfg text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                      Total
                    </th>
                    <th className="px-4 py-4 border-b border-zinc-200 dark:border-darkfg text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                      %
                    </th>
                  </tr>

                  {/* Max Marks Row */}
                  <tr className="bg-zinc-50 dark:bg-darkMode border-t-2 border-zinc-200 dark:border-darkfgfont-bold text-xs uppercase tracking-wider">
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
                        0,
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-100">
                      100%
                    </td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {studentRows.map(([id, student], idx) => {
                    const total = subjects.reduce(
                      (sum, subj) => sum + (student.marks[subj] ?? 0),
                      0,
                    );
                    const maxTotal = subjects.reduce(
                      (sum, subj) => sum + (subjectMaxMap.get(subj) ?? 0),
                      0,
                    );
                    const percentage =
                      maxTotal > 0
                        ? ((total / maxTotal) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={id}
                        className="group hover:bg-LamaHover dark:hover:bg-indigo-500/5 transition-colors duration-150 border-b border-zinc-100 dark:border-darkfg"
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
                              ID: {student.admissionNo}
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
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-4 space-y-4 bg-zinc-50 dark:bg-darkMode">
              {studentRows.map(([id, student], idx) => {
                const total = subjects.reduce(
                  (sum, subj) => sum + (student.marks[subj] ?? 0),
                  0,
                );
                const maxTotal = subjects.reduce(
                  (sum, subj) => sum + (subjectMaxMap.get(subj) ?? 0),
                  0,
                );
                const percentage =
                  maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={id}
                    className="bg-white dark:bg-darkMode rounded-2xl p-4 shadow-sm border border-zinc-200 dark:border-darkfg"
                  >
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-zinc-100 dark:border-darkfg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-darkMode flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
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
                          className="flex justify-between p-2 bg-zinc-50 dark:bg-darkMode rounded-lg"
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

// --- Premium Custom Select Component ---
// This replaces the native <select> with a simulated UI that looks like Shadcn/Headless
function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
  disabled,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(
    (o) => String(o.value) === String(value),
  )?.label;

  return (
    <div
      className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      ref={containerRef}
    >
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
           group flex items-center justify-between w-full p-3 
           bg-zinc-50 dark:bg-darkMode hover:bg-zinc-100 dark:hover:bg-zinc-800/50 
           border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700
           rounded-xl cursor-pointer transition-all duration-200
           ${isOpen ? "ring-2 ring-indigo-500/20 bg-white dark:bg-darkMode" : ""
          }
         `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`
             p-2 rounded-lg transition-colors
             ${value
                ? "bg-indigo-100 dark:bg-darkMode text-indigo-600 dark:text-indigo-400"
                : "bg-zinc-200 dark:bg-darkMode text-zinc-500"
              }
           `}
          >
            {icon}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
              {label}
            </span>
            <span
              className={`text-sm font-semibold truncate ${value ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                }`}
            >
              {selectedLabel || placeholder}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 w-full max-h-60 overflow-y-auto bg-white dark:bg-darkMode border border-zinc-200 dark:border-darkfg rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
          {options.length > 0 ? (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(String(opt.value));
                  setIsOpen(false);
                }}
                className={`
                   px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center justify-between
                   ${String(value) === String(opt.value)
                    ? "bg-indigo-50 dark:bg-darkMode text-indigo-700 dark:text-indigo-300"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-darkbg"
                  }
                 `}
              >
                {opt.label}
                {String(value) === String(opt.value) && (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-400 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
