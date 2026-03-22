"use client";

import { useEffect, useMemo, useState } from "react";
import { Class, Grade } from "@prisma/client";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Calendar,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Check,
  X,
} from "lucide-react";
import { AttendanceResponse } from "../../types";
import { tenantFetch } from "@/lib/tenantFetch";
import { useSchoolSlug } from "./hooks/getschool";

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

// --- Helper Functions ---
const getStudentClassName = (student: any) => {
  return (
    student?.enrollments?.[0]?.class?.name ||
    student?.Class?.section ||
    "N/A"
  );
};

export default function ViewAttendancePage({ role, teacherClassId }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const schoolId = useSchoolSlug();

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [records, setRecords] = useState<AttendanceResponse>({
    attendance: [],
    students: [],
  });

  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | number>("");
  const [selectedClass, setSelectedClass] = useState<string | number>(
    role === "teacher" && teacherClassId ? teacherClassId : "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "absent"
  >("all");

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;

  /* -------------------- Data Fetching -------------------- */
  const fetchAttendance = async () => {
    if (!schoolId) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        start: from,
        end: to,
      });

      if (role === "admin") {
        if (selectedGrade) params.append("gradeId", String(selectedGrade));
        if (selectedClass) params.append("classId", String(selectedClass));
      } else if (teacherClassId) {
        params.append("classId", String(teacherClassId));
      }

      const data = await tenantFetch<AttendanceResponse>(
        schoolId,
        `/attendance?${params.toString()}`,
      );

      setRecords(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!schoolId) return;

    const load = async () => {
      try {
        if (role === "admin") {
          const grades = await tenantFetch<Grade[]>(schoolId, "/grades");
          setGrades(grades);

          if (selectedGrade) {
            const classes = await tenantFetch<Class[]>(
              schoolId,
              `/classes?gradeId=${selectedGrade}`,
            );
            setClasses(classes);
          } else {
            setClasses([]);
          }
        } else if (teacherClassId) {
          const classes = await tenantFetch<Class[]>(
            schoolId,
            `/classes?id=${teacherClassId}`,
          );
          setClasses(Array.isArray(classes) ? classes : [classes]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [role, schoolId, selectedGrade, teacherClassId]);

  /* -------------------- Logic -------------------- */
  const updateAttendance = async (id: number, present: boolean) => {
    try {
      const updated = await tenantFetch<{ attendance: any }>(
        schoolId,
        `/attendance/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ present: !present }),
        },
      );

      setRecords((prev) => ({
        ...prev,
        attendance: prev.attendance.map((a) =>
          a.id === id ? updated.attendance : a,
        ),
      }));
    } catch (error) {
      console.error("Failed to update attendance:", error);
    }
  };

  const studentMap = useMemo(() => {
    const map = new Map();
    (records.students ?? []).forEach((s) => map.set(s.id, s));
    return map;
  }, [records.students]);

  const filteredAttendance = useMemo(() => {
    return records.attendance.filter((a) => {
      const student = studentMap.get(a.studentId);
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "present" && a.present) ||
        (filterStatus === "absent" && !a.present);

      const searchMatch =
        !searchQuery ||
        student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.admissionNo.toString().includes(searchQuery);

      return statusMatch && searchMatch;
    });
  }, [records, searchQuery, filterStatus, studentMap]);

  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const paginated = filteredAttendance.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Attendance");

    const dates = Array.from(
      new Set(
        filteredAttendance.map((a) =>
          new Date(a.date).toLocaleDateString("en-GB"),
        ),
      ),
    );

    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Class", key: "class", width: 15 },
      ...dates.map((d) => ({ header: d, key: d, width: 12 })),
    ];

    records.students.forEach((s) => {
      const row: any = {
        id: s.id,
        name: s.name,
        admissionNo: s.admissionNo,
        class: getStudentClassName(s),
      };

      dates.forEach((d) => {
        const a = filteredAttendance.find(
          (x) =>
            x.studentId === s.id &&
            new Date(x.date).toLocaleDateString("en-GB") === d,
        );
        row[d] = a ? (a.present ? "Present" : "Absent") : "";
      });

      ws.addRow(row);
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Attendance_${from}_to_${to}.xlsx`);
  };

  // --- Style Constants ---
  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border bg-white dark:bg-darkfg border-slate-200 dark:border-slate-700 text-darkfg dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5";

  /* ============================================================ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkMode p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-darkfg dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Attendance Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and view student attendance records.
          </p>
        </div>
      </div>



      {/* Control Panel Card */}
      <div className="bg-white dark:bg-darkfg border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-6">

        {/* Top Row: Date Range & Class Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {role === "admin" && (
            <>
              <div>
                <label className={labelClass}>Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Grade</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Class Section</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedGrade}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.section}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className={`${role !== "admin" ? "lg:col-span-3" : ""}`}>
            <label className="block text-xs font-semibold text-transparent mb-1.5 md:hidden lg:block">
              Action
            </label>
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className={`w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg font-medium text-white transition-all
                ${loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm hover:shadow"
                }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Fetching..." : "Get Records"}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Bottom Row: Search, Filter, Export */}
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                placeholder="Search student name or ID..."
                className={`${inputClass} pl-9`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={`${inputClass} pl-9`}
              >
                <option value="all">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="w-full md:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white dark:bg-darkfg border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No attendance records found
            </div>
          )}
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map((a) => {
              const s = studentMap.get(a.studentId);
              if (!s) return null;

              const isPresent = a.present;

              return (
                
                <button
                  key={a.id}
                  onClick={() => {
                    if (confirm("Toggle attendance?")) {
                      updateAttendance(a.id, a.present);
                    }
                  }}
                  className={`group relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.98]

        ${isPresent
                      ? "bg-white dark:bg-darkfg border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50"
                      : "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50"
                    }

        shadow-sm hover:shadow-md`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold mr-3
          ${isPresent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        : "bg-white dark:bg-darkMode text-rose-500"
                      }`}
                  >
                    {s.name.charAt(0)}
                  </div>
                  

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${isPresent
                        ? "text-darkfg dark:text-slate-100"
                        : "text-rose-700 dark:text-rose-400"
                        }`}
                    >
                      {s.name} ({s.admissionNo})
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(a.date).toLocaleDateString( "en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </p>

                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                      {getStudentClassName(s)}
                    </span>
                  </div>

                  {/* Icons */}
                  {!isPresent && (
                    <div className="absolute top-3 right-3">
                      <X className="w-5 h-5 text-rose-500" />
                    </div>
                  )}

                  {isPresent && (
                    <div className="absolute top-3 right-3">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}

                  {/* Status */}
                  <div
                    className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase ${isPresent ? "text-emerald-600" : "text-rose-600"
                      }`}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-darkfg/50 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
