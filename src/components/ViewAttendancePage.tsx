"use client";

import { useEffect, useMemo, useState } from "react";
import { Class, Grade } from "@prisma/client";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { AttendanceResponse } from "../../types";

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

const getStudentClassName = (student: any) => {
  const grade = student?.Class?.Grade?.level;
  const section = student?.Class?.section;
  return grade && section ? `${grade} - ${section}` : "N/A";
};

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
  const [filterStatus, setFilterStatus] = useState<
    "all" | "present" | "absent"
  >("all");

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;

  /* -------------------- Fetch Attendance -------------------- */
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

  /* -------------------- Fetch Grades / Classes -------------------- */
  useEffect(() => {
    const load = async () => {
      if (role === "admin") {
        const g = await fetch("/api/grades").then((r) => r.json());
        setGrades(g);

        if (selectedGrade) {
          const c = await fetch(`/api/classes?gradeId=${selectedGrade}`).then(
            (r) => r.json()
          );
          setClasses(c);
        } else {
          setClasses([]);
        }
      } else if (teacherClassId) {
        const c = await fetch(`/api/classes?id=${teacherClassId}`).then((r) =>
          r.json()
        );
        setClasses(Array.isArray(c) ? c : [c]);
      }
    };

    load();
  }, [role, selectedGrade, teacherClassId]);

  useEffect(() => {
    fetchAttendance();
  }, [from, to, selectedGrade, selectedClass, role, teacherClassId]);

  /* -------------------- Update Attendance -------------------- */
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

  /* -------------------- Filtering -------------------- */

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
  }, [records, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const paginated = filteredAttendance.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  /* -------------------- Export Excel -------------------- */
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

  /* ============================================================ */
  /* ============================================================ */
  return (
    <div className="p-4 space-y-5 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold dark:bg-[#121727] dark:text-gray-100">
        Attendance Report
      </h1>

      {/* ---------------- Filters ---------------- */}
      <div className="bg-gray-100 dark:bg-[#121727] p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* From Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-10 px-3 rounded-md 
               dark:bg-[#121727] dark:text-white 
               border 
               focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-10 px-3 rounded-md 
               dark:bg-[#121727] dark:text-white 
               border 
               focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
            />
          </div>

          {role === "admin" && (
            <>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full h-10 px-3 rounded-md 
               dark:bg-[#121727] dark:text-white 
               border 
               focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
              >
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.level}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedGrade}
                className="w-full h-10 px-3 rounded-md 
               dark:bg-[#121727] dark:text-white 
               border 
               focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.section}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Loading..." : "Get Attendance"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Search by name or ID"
            className="w-full h-10 sm:w-64 border dark:bg-[#121727] dark:text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full h-10 sm:w-64 border dark:bg-[#121727] dark:text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
          >
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button
            onClick={exportToExcel}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* ---------------- Desktop Directory Header ---------------- */}
      <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-gray-500">
        <div>Student</div>
        <div>Date</div>
        <div>Class</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {/* ---------------- Desktop Directory Rows ---------------- */}
      <div className="hidden md:block divide-y">
        {paginated.map((a) => {
          const s = records.students.find((x) => x.id === a.studentId);
          if (!s) return null;

          return (
            <div
              key={a.id}
              className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition"
            >
              {/* Student */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                  {s.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-xs text-gray-500">ID: {s.id}</p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-700">
                {new Date(a.date).toLocaleDateString()}
              </div>

              {/* Class */}
              <div className="text-sm text-gray-700">
                {getStudentClassName(s)}
              </div>

              {/* Status */}
              <div
                className={`text-sm font-medium ${
                  a.present ? "text-green-600" : "text-red-600"
                }`}
              >
                {a.present ? "Present" : "Absent"}
              </div>

              {/* Action */}
              <div className="flex justify-end">
                <button
                  onClick={() => updateAttendance(a.id, a.present)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-200"
                  title="Edit Attendance"
                >
                  ✏️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- Mobile Cards ---------------- */}
      <div className="md:hidden space-y-3">
        {paginated.map((a) => {
          const s = records.students.find((x) => x.id === a.studentId);
          if (!s) return null;

          return (
            <div key={a.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{s.name}</span>
                <span className={a.present ? "text-green-600" : "text-red-600"}>
                  {a.present ? "Present" : "Absent"}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {s.id} · {getStudentClassName(s)}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(a.date).toLocaleDateString()}
              </p>

              <button
                onClick={() => updateAttendance(a.id, a.present)}
                className="w-full py-2 bg-gray-800 text-white rounded"
              >
                Toggle Status
              </button>
            </div>
          );
        })}
      </div>

      {/* ---------------- Pagination ---------------- */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
