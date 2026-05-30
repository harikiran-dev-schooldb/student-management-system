"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { toast } from "react-toastify";

import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Loader2,
  Save,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

import { tenantFetch } from "@/lib/tenantFetch";

import { useSchoolSlug } from "./hooks/getschool";

type StaffAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "ON_LEAVE";

type StaffMember = {
  id: string;
  name: string;
  username: string;
  phone: string;
  img?: string | null;
};

type StaffAttendanceRecord = {
  id: number;
  date: string;
  status: StaffAttendanceStatus;
  teacherId: string;
  teacher: StaffMember;
};

type StaffAttendanceResponse = {
  attendance: StaffAttendanceRecord[];
  teachers: StaffMember[];
};

type Props = {
  role: "admin" | "teacher";
};

const statusOptions: {
  value: StaffAttendanceStatus;
  label: string;
}[] = [
  {
    value: "PRESENT",
    label: "Present",
  },
  {
    value: "ABSENT",
    label: "Absent",
  },
  {
    value: "LATE",
    label: "Late",
  },
  {
    value: "HALF_DAY",
    label: "Half Day",
  },
  {
    value: "ON_LEAVE",
    label: "Leave",
  },
];

const statusLabels = Object.fromEntries(
  statusOptions.map((status) => [status.value, status.label]),
) as Record<StaffAttendanceStatus, string>;

export default function StaffAttendancePage({ role }: Props) {
  const schoolId = useSchoolSlug();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const [teachers, setTeachers] = useState<StaffMember[]>([]);

  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);

  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const [attendance, setAttendance] = useState<
    Record<string, StaffAttendanceStatus>
  >({});

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 24;

  const searchInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border bg-white dark:bg-darkfg border-slate-200 dark:border-slate-700 text-darkfg dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";

  /* -------------------------------- */
  /* Ctrl + F Focus */
  /* -------------------------------- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        e.preventDefault();

        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* -------------------------------- */
  /* Load Attendance */
  /* -------------------------------- */

  const loadAttendance = async () => {
    if (!schoolId) return;

    setLoading(true);

    try {
      const data = await tenantFetch<StaffAttendanceResponse>(
        schoolId,
        `/staff-attendance?date=${date}`,
      );

      const existing: Record<string, StaffAttendanceStatus> = {};

      data.attendance.forEach((record) => {
        existing[record.teacherId] = record.status;
      });

      const initial: Record<string, StaffAttendanceStatus> = {};

      data.teachers.forEach((teacher) => {
        initial[teacher.id] = existing[teacher.id] ?? "PRESENT";
      });

      setTeachers(data.teachers);

      setRecords(data.attendance);

      setAttendance(initial);
    } catch (error: any) {
      toast.error(error.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [schoolId, date]);

  /* -------------------------------- */
  /* Search */
  /* -------------------------------- */

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;

    const query = searchQuery.toLowerCase();

    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.username.toLowerCase().includes(query) ||
        teacher.phone.includes(searchQuery),
    );
  }, [teachers, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /* -------------------------------- */
  /* Pagination */
  /* -------------------------------- */

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const visibleTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  /* -------------------------------- */
  /* Stats */
  /* -------------------------------- */

  const counts = useMemo(() => {
    return teachers.reduce(
      (acc, teacher) => {
        acc[attendance[teacher.id] ?? "PRESENT"] += 1;

        return acc;
      },
      {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        HALF_DAY: 0,
        ON_LEAVE: 0,
      } as Record<StaffAttendanceStatus, number>,
    );
  }, [attendance, teachers]);

  /* -------------------------------- */
  /* Actions */
  /* -------------------------------- */

  const setAll = (status: StaffAttendanceStatus) => {
    const updated: Record<string, StaffAttendanceStatus> = {};

    filteredTeachers.forEach((teacher) => {
      updated[teacher.id] = status;
    });

    setAttendance((previous) => ({
      ...previous,
      ...updated,
    }));
  };

  const saveAttendance = async () => {
    if (!teachers.length) {
      toast.error("No staff members found");

      return;
    }

    setSubmitting(true);

    try {
      await tenantFetch(schoolId, "/staff-attendance", {
        method: "POST",

        body: JSON.stringify(
          teachers.map((teacher) => ({
            teacherId: teacher.id,

            date,

            status: attendance[teacher.id] ?? "PRESENT",
          })),
        ),
      });

      toast.success("Attendance saved successfully");

      await loadAttendance();
    } catch (error: any) {
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------- */
  /* Export Excel */
  /* -------------------------------- */

  const exportToExcel = async () => {
    if (!teachers.length) {
      toast.error("No attendance data available");

      return;
    }

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Staff Attendance");

    worksheet.columns = [
      {
        header: "Teacher",
        key: "name",
        width: 28,
      },
      {
        header: "Username",
        key: "username",
        width: 20,
      },
      {
        header: "Phone",
        key: "phone",
        width: 16,
      },
      {
        header: "Date",
        key: "date",
        width: 16,
      },
      {
        header: "Status",
        key: "status",
        width: 18,
      },
    ];

    teachers.forEach((teacher) => {
      worksheet.addRow({
        name: teacher.name,
        username: teacher.username,
        phone: teacher.phone,
        date,
        status: statusLabels[attendance[teacher.id] ?? "PRESENT"],
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([buffer]), `Staff_Attendance_${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkMode p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-darkfg dark:text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Staff Attendance
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Mark and manage daily teacher attendance.
        </p>
      </div>
      {/* Control Panel */}
      <div className="bg-white dark:bg-darkfg border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Date
            </label>

            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Search Staff
            </label>

            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none" />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search teacher..."
                className={`${inputClass} pl-9`}
              />

              <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="inline-flex h-5 items-center rounded border bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] text-slate-500">
                  ⌘F
                </kbd>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {role === "admin" && (
            <>
              <button
                type="button"
                onClick={() => setAll("PRESENT")}
                className="
                  h-10 rounded-xl border
                  border-emerald-200
                  text-emerald-700
                  hover:bg-emerald-50
                  flex items-center justify-center gap-2
                "
              >
                <UserCheck className="w-4 h-4" />
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => setAll("ABSENT")}
                className="
                  h-10 rounded-xl border
                  border-rose-200
                  text-rose-700
                  hover:bg-rose-50
                  flex items-center justify-center gap-2
                "
              >
                <UserX className="w-4 h-4" />
                Mark All Absent
              </button>
            </>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusOptions.map((status) => (
          <div
            key={status.value}
            className="
                rounded-xl border
                px-4 py-3
                bg-white dark:bg-darkfg
                border-slate-200 dark:border-slate-800
              "
          >
            <p className="text-xs font-medium text-slate-500">{status.label}</p>

            <p className="mt-1 text-2xl font-bold text-darkfg dark:text-white">
              {counts[status.value]}
            </p>
          </div>
        ))}
      </div>
      {/* Teacher Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : visibleTeachers.length === 0 ? (
        <div className="p-10 text-center text-slate-500 rounded-xl border bg-white dark:bg-darkfg dark:border-slate-800">
          No teachers found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleTeachers.map((teacher) => {
              const selected = attendance[teacher.id] ?? "PRESENT";

              const isPresent = selected === "PRESENT";

              const statusColor =
                selected === "PRESENT"
                  ? `
              border-emerald-200 bg-emerald-50
              dark:border-emerald-900/40 dark:bg-emerald-950/20
            `
                  : selected === "ABSENT"
                    ? `
              border-rose-200 bg-rose-50
              dark:border-rose-900/40 dark:bg-rose-950/20
            `
                    : selected === "LATE"
                      ? `
              border-amber-200 bg-amber-50
              dark:border-amber-900/40 dark:bg-amber-950/20
            `
                      : selected === "HALF_DAY"
                        ? `
              border-sky-200 bg-sky-50
              dark:border-sky-900/40 dark:bg-sky-950/20
            `
                        : `
              border-violet-200 bg-violet-50
              dark:border-violet-900/40 dark:bg-violet-950/20
            `;

              return (
                <div
                  key={teacher.id}
                  role="button"
                  tabIndex={0}
                  /* Single Click */
                  onClick={() => {
                    if (clickTimeout.current) {
                      clearTimeout(clickTimeout.current);

                      clickTimeout.current = null;

                      return;
                    }

                    clickTimeout.current = setTimeout(() => {
                      setAttendance((previous) => ({
                        ...previous,

                        [teacher.id]:
                          selected === "PRESENT" ? "ABSENT" : "PRESENT",
                      }));

                      clickTimeout.current = null;
                    }, 220);
                  }}
                  /* Double Click */
                  onDoubleClick={() => {
                    if (clickTimeout.current) {
                      clearTimeout(clickTimeout.current);

                      clickTimeout.current = null;
                    }

                    setExpandedTeacher((previous) =>
                      previous === teacher.id ? null : teacher.id,
                    );
                  }}
                  className={`

      relative flex items-center

      p-4 rounded-2xl border-2

      transition-all duration-200

      text-left shadow-sm

      hover:shadow-md

      active:scale-[0.98]

      cursor-pointer

      overflow-hidden

      group

      ${statusColor}

    `}
                >
                  {/* Avatar */}
                  <div
                    className={`
                h-12 w-12 rounded-full
                flex items-center justify-center
                text-sm font-bold mr-3
                transition-colors
                ${
                  isPresent
                    ? `
                      bg-white dark:bg-slate-800
                      text-emerald-700 dark:text-emerald-300
                    `
                    : `
                      bg-white dark:bg-slate-800
                      text-rose-600 dark:text-rose-300
                    `
                }
              `}
                  >
                    {teacher.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                  font-semibold text-sm truncate
                  ${
                    isPresent
                      ? `
                        text-emerald-800 dark:text-emerald-200
                      `
                      : `
                        text-rose-700 dark:text-rose-300
                      `
                  }
                `}
                    >
                      {teacher.name}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {teacher.username}
                    </p>

                    <p className="text-xs text-slate-400 truncate">
                      {teacher.phone}
                    </p>
                  </div>

                  {/* Status Icon */}
                  <div className="absolute top-3 right-3">
                    {selected === "PRESENT" && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}

                    {selected === "ABSENT" && (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}

                    {selected === "LATE" && (
                      <Clock3 className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className="
                absolute bottom-3 right-3
                text-[10px] font-bold uppercase tracking-wider
              "
                  >
                    {statusLabels[selected]}
                  </div>

                  {/* Expanded Actions */}
                  {expandedTeacher === teacher.id && (
                    <div
                      className="
                  absolute inset-0
                  bg-white/80 dark:bg-slate-900/80
                  animate-in fade-in zoom-in-95 duration-150
                  flex items-center justify-center
                  rounded-2xl
                  z-20
                "
                      onClick={() => setExpandedTeacher(null)}
                    >
                      <div className="grid grid-cols-2 gap-2 p-3 w-full max-w-[220px]">
                        {statusOptions
                          .filter(
                            (status) =>
                              status.value !== "PRESENT" &&
                              status.value !== "ABSENT",
                          )
                          .map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                setAttendance((previous) => ({
                                  ...previous,
                                  [teacher.id]: status.value,
                                }));

                                setExpandedTeacher(null);
                              }}
                              className={`
                        h-10 rounded-xl text-xs
                        font-semibold border
                        transition-all
                        ${
                          selected === status.value
                            ? `
                              bg-indigo-600
                              text-white
                              border-indigo-600
                            `
                            : `
                              bg-white dark:bg-slate-900
                              border-slate-200 dark:border-slate-700
                              hover:bg-slate-100
                              dark:hover:bg-slate-800
                            `
                        }
                      `}
                            >
                              {status.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((previous) => Math.max(1, previous - 1))
                }
                disabled={currentPage === 1}
                className="
            p-2 rounded-full border
            border-slate-200 dark:border-slate-800
            hover:bg-slate-100 dark:hover:bg-slate-800
            disabled:opacity-50
          "
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(totalPages, previous + 1),
                  )
                }
                disabled={currentPage === totalPages}
                className="
            p-2 rounded-full border
            border-slate-200 dark:border-slate-800
            hover:bg-slate-100 dark:hover:bg-slate-800
            disabled:opacity-50
          "
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
      ```
      {/* Sticky Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3">
        <button
          type="button"
          onClick={exportToExcel}
          className="
            h-14 px-5 rounded-2xl
            bg-white dark:bg-darkfg
            border border-slate-200 dark:border-slate-700
            shadow-xl
            flex items-center gap-2
          "
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={saveAttendance}
          disabled={submitting || loading}
          className="
            h-14 px-6 rounded-2xl
            bg-emerald-600 hover:bg-emerald-700
            text-white font-semibold
            shadow-2xl
            flex items-center gap-3
            transition-all hover:-translate-y-1
            active:scale-95
            disabled:opacity-70
          "
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Attendance
        </button>
      </div>
    </div>
  );
}
