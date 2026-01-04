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
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Users
} from "lucide-react";
import { AttendanceResponse } from "../../types";

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

// --- Helper Functions ---
const getStudentClassName = (student: any) => {
  const grade = student?.Class?.Grade?.level;
  const section = student?.Class?.section;
  return grade && section ? `${grade} - ${section}` : "N/A";
};

// --- Reusable Components for Consistency ---
const StatusBadge = ({ present }: { present: boolean }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      present
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
    }`}
  >
    {present ? "Present" : "Absent"}
  </span>
);

export default function ViewAttendancePage({ role, teacherClassId }: Props) {
  const today = new Date().toISOString().split("T")[0];

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
    role === "teacher" && teacherClassId ? teacherClassId : ""
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;

  /* -------------------- Data Fetching -------------------- */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = `/api/attendance/range?from=${from}&to=${to}`;

      if (role === "admin") {
        if (selectedGrade) url += `&gradeId=${selectedGrade}`;
        if (selectedClass) url += `&classId=${selectedClass}`;
      } else if (teacherClassId) {
        url += `&classId=${teacherClassId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setRecords(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (role === "admin") {
        const g = await fetch("/api/grades").then((r) => r.json());
        setGrades(g);

        if (selectedGrade) {
          const c = await fetch(`/api/classes?gradeId=${selectedGrade}`).then((r) => r.json());
          setClasses(c);
        } else {
          setClasses([]);
        }
      } else if (teacherClassId) {
        const c = await fetch(`/api/classes?id=${teacherClassId}`).then((r) => r.json());
        setClasses(Array.isArray(c) ? c : [c]);
      }
    };

    load();
  }, [role, selectedGrade, teacherClassId]);

  useEffect(() => {
    fetchAttendance();
  }, [from, to, selectedGrade, selectedClass, role, teacherClassId]);

  /* -------------------- Logic -------------------- */
  const updateAttendance = async (id: number, present: boolean) => {
    const res = await fetch("/api/attendance/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId: id, present: !present }),
    });

    if (res.ok) {
      setRecords((prev) => ({
        ...prev,
        attendance: prev.attendance.map((a) =>
          a.id === id ? { ...a, present: !present } : a
        ),
      }));
    }
  };

  const studentMap = useMemo(() => {
    const map = new Map();
    records.students.forEach((s) => map.set(s.id, s));
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
        student?.id.toString().includes(searchQuery);

      return statusMatch && searchMatch;
    });
  }, [records, searchQuery, filterStatus, studentMap]);

  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const paginated = filteredAttendance.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Attendance");

    const dates = Array.from(
      new Set(
        filteredAttendance.map((a) =>
          new Date(a.date).toLocaleDateString("en-GB")
        )
      )
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
        class: getStudentClassName(s),
      };

      dates.forEach((d) => {
        const a = filteredAttendance.find(
          (x) =>
            x.studentId === s.id &&
            new Date(x.date).toLocaleDateString("en-GB") === d
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
  const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5";

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

          <div className={`${role !== 'admin' ? 'lg:col-span-3' : ''}`}>
            <label className="block text-xs font-semibold text-transparent mb-1.5 md:hidden lg:block">Action</label>
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className={`w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg font-medium text-white transition-all
                ${loading 
                  ? "bg-indigo-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm hover:shadow"
                }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Student</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.length > 0 ? (
                paginated.map((a) => {
                  const s = records.students.find((x) => x.id === a.studentId);
                  if (!s) return null;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-darkfg dark:text-slate-100">{s.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                           {getStudentClassName(s)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge present={a.present} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => updateAttendance(a.id, a.present)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors"
                          title="Toggle Attendance"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <Search className="w-8 h-8 opacity-20" />
                       <p>No attendance records found for the selected criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginated.length > 0 ? (
            paginated.map((a) => {
              const s = records.students.find((x) => x.id === a.studentId);
              if (!s) return null;

              return (
                <div key={a.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-darkfg dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.id} • {getStudentClassName(s)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge present={a.present} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(a.date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => updateAttendance(a.id, a.present)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Edit Status
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
               No records found.
             </div>
          )}
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