"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Class, Grade, Student } from "@prisma/client";
import { toast } from "react-toastify";
import {
  Calendar,
  Check,
  X,
  Search,
  Save,
  Users,
  Filter,
  UserCheck,
  UserX,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { tenantFetch } from "@/lib/tenantFetch";
import { useSchoolSlug } from "./hooks/getschool";

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

type StudentRow = {
  id: string;
  name: string;
  admissionNo: string;
  classId: number;
};

export default function MarkAttendancePage({ role, teacherClassId }: Props) {
  const { register, handleSubmit, getValues, watch } = useForm();
  const today = new Date().toISOString().split("T")[0];

  // --- Data State ---
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(
    role === "teacher" ? teacherClassId ?? null : null,
  );

  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [allAbsent, setAllAbsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Refs ---
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedDate = watch("date");

  const schoolId = useSchoolSlug();
  console.log("School ID param:", schoolId);

  /* -------------------- Custom Ctrl+F Logic -------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+F or Cmd+F (Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        e.preventDefault(); // Stop browser's default "Find"
        searchInputRef.current?.focus(); // Focus our input
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* -------------------- Load Grades/Classes -------------------- */
  useEffect(() => {
    if (role !== "admin" || !schoolId) return;

    tenantFetch(schoolId, "/grades")
      .then(setGrades)
      .catch(console.error);
  }, [role, schoolId]);

  useEffect(() => {
    if (role === "admin" && selectedGrade != null) {
      tenantFetch<Class[]>(schoolId, `/grades/${selectedGrade}/classes`)
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => setClasses([]));
    }
  }, [role, selectedGrade, schoolId]);

  useEffect(() => {
    setSelectedClass(null);
    setStudents([]);
  }, [selectedGrade]);

  /* -------------------- Auto Load for Teacher -------------------- */
  useEffect(() => {
    if (role === "teacher" && teacherClassId && selectedDate) {
      fetchStudents();
    }
  }, [role, teacherClassId, selectedDate]);

  /* -------------------- Fetch Students -------------------- */
  const fetchStudents = async () => {
    if (!schoolId) return;

    setLoading(true);

    try {
      const selectedDate = getValues("date") || today;

      const params = new URLSearchParams();
      let queryClassId: number | null = null;

      // 🔹 Query Building (Type-safe)
      if (role === "teacher" && teacherClassId != null) {
        params.append("classId", teacherClassId.toString());
        queryClassId = teacherClassId;
      } else if (selectedClass != null) {
        params.append("classId", selectedClass.toString());
        queryClassId = selectedClass;
      } else if (selectedGrade != null) {
        params.append("gradeId", selectedGrade.toString());
      }

      const studentsData = await tenantFetch<StudentRow[]>(
        schoolId,
        `/students?${params.toString()}`,
      );

      setStudents(studentsData);
      setCurrentPage(1);

      // 🔹 Load Attendance History
      const existingMap: Record<string, boolean> = {};
      let hasHistory = false;

      if (queryClassId != null) {
        const historyParams = new URLSearchParams();
        historyParams.append("date", selectedDate);
        historyParams.append("classId", queryClassId.toString());

        try {
          const historyRes = await tenantFetch(
            schoolId,
            `/attendance?${historyParams.toString()}`
          );

          if (historyRes.ok) {
            const historyData = await historyRes.json();

            historyData.attendance.forEach((rec: any) => {
              existingMap[rec.studentId] = rec.present;
            });


          }
        } catch (err) {
          console.error("Failed to fetch history", err);
        }
      }

      // 🔹 Initialize Attendance State
      const initialAttendance: Record<string, boolean> = {};



      studentsData.forEach((s) => {
        initialAttendance[s.id] = existingMap[s.id] ?? true;
      });

      setAttendance(initialAttendance);

      const isEveryoneAbsent = students.every((s) => attendance[s.id] === false);

      setAllAbsent(isEveryoneAbsent);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Filtering & Pagination -------------------- */



  // 1. Filter Logic: Runs on the ENTIRE list first
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;

    const lowerQuery = searchQuery.toLowerCase();

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.admissionNo.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  // 2. Reset page when user searches
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (role === "admin" && selectedDate) {
      fetchStudents();
    }
  }, [selectedGrade, selectedClass, selectedDate]);

  // 3. Pagination Logic: Slices the FILTERED list
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const visibleStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* -------------------- Actions -------------------- */
  const toggleStudent = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    // Apply to ALL filtered students (so users don't have to mark page by page)
    filteredStudents.forEach((s) => (updated[s.id] = present));

    // Merge with existing state to preserve other students' status
    setAttendance((prev) => ({ ...prev, ...updated }));
    setAllAbsent(!present);
  };

  console.log("Frontend schoolId:", schoolId);



  const onSubmit = async (data: any) => {

    if (role === "teacher" && !teacherClassId) {
      toast.error("Teacher class not assigned");
      return;
    }

    if (!students.length) {
      toast.error("No students loaded");
      return;
    }

    setSubmitting(true);

    // 🔹 Remove students without classId (safety)
    const validStudents = students.filter((s) => s.classId);

    if (!validStudents.length) {
      toast.error("No valid students found");
      setSubmitting(false);
      return;
    }

    const payload = validStudents.map((s) => ({
      studentId: s.id,
      admissionNo: s.admissionNo,
      classId: s.classId,
      date: data.date,
      present: attendance[s.id] ?? true,
    }));

    console.log("Attendance payload:", payload);

    try {
      await tenantFetch(schoolId, "/attendance", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Attendance submitted successfully!");

      setStudents([]);
      setAttendance({});
      setAllAbsent(false);
      setSearchQuery("");

    } catch (error) {
      console.error(error);
      toast.error("Failed to submit attendance");
      console.error("Attendance POST error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Styles ---
  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border bg-white dark:bg-darkfg border-slate-200 dark:border-slate-700 text-darkfg dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen bg-slate-50 dark:bg-darkMode p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-darkfg dark:text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Mark Attendance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a class and date to update student attendance.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-darkfg border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Date Input */}
          <div>
            <label className={labelClass}>Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                defaultValue={today}
                {...register("date")}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Admin Filters */}
          {role === "admin" && (
            <>
              <div>
                <label className={labelClass}>Grade Level</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    onChange={(e) =>
                      setSelectedGrade(e.target.value ? Number(e.target.value) : null)
                    }
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">Select Grade</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Class Section</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    onChange={(e) =>
                      setSelectedClass(e.target.value ? Number(e.target.value) : null)
                    }
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">Select Class</option>
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Load Button */}
          {/* Load Button (Admin Only) */}
          {role === "admin" && (
            <div>
              <label className="block text-xs font-semibold text-transparent mb-1.5 md:hidden sm:block">
                Action
              </label>
              <button
                type="button"
                onClick={fetchStudents}
                disabled={loading}
                className={`w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg font-medium text-white transition-all
        ${loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm"
                  }`}
              >
                {loading ? "Loading..." : "Load Students"}
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {students.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Action Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-darkfg p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Middle: Search Box with Ctrl+F */}
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-9 h-9`}
              />
              <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-xs">⌘</span>F
                </kbd>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              {allAbsent ? (
                <button
                  type="button"
                  onClick={() => markAll(true)}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Mark All Present
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => markAll(false)}
                  className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Mark All Absent
                </button>
              )}

              {/* Sticky Submit Footer */}
              <div className="sticky bottom-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 font-medium transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:transform-none"
                >
                  {submitting ? "Saving..." : "Save Attendance"}
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleStudents.map((s) => {
              const isPresent = attendance[s.id];
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`group relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.98]

                    // Attendance Cards 
                    ${isPresent
                      ? "bg-white dark:bg-darkfg border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50"
                      : "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50"
                    } shadow-sm hover:shadow-md`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 transition-colors
                    ${isPresent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-400"
                        : "bg-white dark:bg-darkMode text-rose-500"
                      }`}
                  >
                    {s.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${isPresent
                        ? "text-darkfg dark:text-slate-100"
                        : "text-rose-700 dark:text-rose-400"
                        }`}
                    >
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {s.admissionNo}
                    </p>
                  </div>

                  <div
                    className={`absolute top-3 right-3 transition-transform duration-200 ${isPresent ? "scale-0 opacity-0" : "scale-100 opacity-100"
                      }`}
                  >
                    <X className="w-5 h-5 text-rose-500" />
                  </div>
                  <div
                    className={`absolute top-3 right-3 transition-transform duration-200 ${!isPresent ? "scale-0 opacity-0" : "scale-100 opacity-100"
                      }`}
                  >
                    <Check className="w-5 h-5 text-slate-200 dark:text-slate-700 group-hover:text-emerald-500" />
                  </div>

                  <div
                    className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider ${isPresent
                      ? "text-slate-300 dark:text-slate-600 group-hover:text-emerald-600"
                      : "text-rose-600 dark:text-rose-400"
                      }`}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}


        </div>
      )}
    </form>
  );
}
