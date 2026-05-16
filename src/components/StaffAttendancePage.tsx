"use client";

import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  Save,
  Search,
  UserCheck,
  Users,
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
  checkIn?: string | null;
  checkOut?: string | null;
  remarks?: string | null;
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
  className: string;
}[] = [
  {
    value: "PRESENT",
    label: "Present",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  {
    value: "ABSENT",
    label: "Absent",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300",
  },
  {
    value: "LATE",
    label: "Late",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
  },
  {
    value: "HALF_DAY",
    label: "Half Day",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
  },
  {
    value: "ON_LEAVE",
    label: "On Leave",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300",
  },
];

const statusLabels = Object.fromEntries(
  statusOptions.map((status) => [status.value, status.label]),
) as Record<StaffAttendanceStatus, string>;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StaffAttendancePage({ role }: Props) {
  const schoolId = useSchoolSlug();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<StaffMember[]>([]);
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, StaffAttendanceStatus>
  >({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      toast.error(error.message || "Failed to load staff attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [schoolId, date]);

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

  const setAll = (status: StaffAttendanceStatus) => {
    const next: Record<string, StaffAttendanceStatus> = {};

    filteredTeachers.forEach((teacher) => {
      next[teacher.id] = status;
    });

    setAttendance((previous) => ({ ...previous, ...next }));
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

      toast.success("Staff attendance saved");
      await loadAttendance();
    } catch (error: any) {
      toast.error(error.message || "Failed to save staff attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const exportToExcel = async () => {
    if (!teachers.length) {
      toast.error("No staff attendance data to export");
      return;
    }

    const savedRecordMap = new Map(
      records.map((record) => [record.teacherId, record]),
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Staff Attendance");

    worksheet.columns = [
      { header: "Staff Name", key: "name", width: 28 },
      { header: "Username", key: "username", width: 18 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Date", key: "date", width: 16 },
      { header: "Status", key: "status", width: 16 },
      { header: "Saved", key: "saved", width: 12 },
    ];

    teachers.forEach((teacher) => {
      const savedRecord = savedRecordMap.get(teacher.id);
      const selectedStatus = attendance[teacher.id] ?? "PRESENT";

      worksheet.addRow({
        name: teacher.name,
        username: teacher.username,
        phone: teacher.phone,
        date,
        status: statusLabels[selectedStatus],
        saved: savedRecord ? "Yes" : "No",
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Staff_Attendance_${date}.xlsx`);
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-darkfg transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-darkfg dark:text-slate-100";

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 dark:bg-darkMode md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-darkfg dark:text-white">
            <UserCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Staff Attendance
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Mark and review daily staff attendance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={loading || !teachers.length}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-darkfg dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={submitting || loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Attendance
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-darkfg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Date
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Search Staff
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, username or phone"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {role === "admin" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAll("PRESENT")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                All Present
              </button>
              <button
                type="button"
                onClick={() => setAll("ABSENT")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                <XCircle className="h-4 w-4" />
                All Absent
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {statusOptions.map((status) => (
          <div
            key={status.value}
            className={`rounded-lg border px-4 py-3 ${status.className}`}
          >
            <p className="text-xs font-medium">{status.label}</p>
            <p className="mt-1 text-2xl font-bold">{counts[status.value]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-darkfg">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-darkfg dark:text-white">
              Staff List
            </h2>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No staff members found
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTeachers.map((teacher) => {
              const selected = attendance[teacher.id] ?? "PRESENT";

              return (
                <div
                  key={teacher.id}
                  className="grid gap-4 p-4 md:grid-cols-[minmax(180px,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-darkfg dark:text-white">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {teacher.username} / {teacher.phone}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    {statusOptions.map((status) => (
                      <button
                        type="button"
                        key={status.value}
                        onClick={() =>
                          setAttendance((previous) => ({
                            ...previous,
                            [teacher.id]: status.value,
                          }))
                        }
                        className={`h-9 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                          selected === status.value
                            ? status.className
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {records.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-darkfg">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <Clock3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-darkfg dark:text-white">
              Saved Records
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Staff</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-5 py-3 font-medium text-darkfg dark:text-white">
                      {record.teacher.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {statusLabels[record.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
