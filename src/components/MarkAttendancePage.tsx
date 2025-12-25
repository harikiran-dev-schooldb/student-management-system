"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Class, Grade, Student } from "@prisma/client";
import { toast } from "react-toastify";

interface Props {
  role: "admin" | "teacher";
  teacherClassId?: number;
}

export default function MarkAttendancePage({ role, teacherClassId }: Props) {
  const { register, handleSubmit } = useForm();
  const today = new Date().toISOString().split("T")[0];

  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(
    role === "teacher" ? teacherClassId ?? null : null
  );

  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [allAbsent, setAllAbsent] = useState(false);

  /* -------------------- Load Grades -------------------- */
  useEffect(() => {
    if (role === "admin") {
      fetch("/api/grades")
        .then((r) => r.json())
        .then(setGrades);
    }
  }, [role]);

  /* -------------------- Load Classes -------------------- */
  useEffect(() => {
    if (role === "admin" && selectedGrade) {
      fetch(`/api/classes?gradeId=${selectedGrade}`)
        .then((r) => r.json())
        .then(setClasses);
    }
  }, [role, selectedGrade]);

  /* -------------------- Fetch Students -------------------- */
  const fetchStudents = async () => {
    let url = "/api/students";

    if (role === "teacher" && teacherClassId) {
      url += `?classId=${teacherClassId}`;
    } else if (selectedClass) {
      url += `?classId=${selectedClass}`;
    } else if (selectedGrade) {
      url += `?gradeId=${selectedGrade}`;
    }

    const data = await fetch(url).then((r) => r.json());
    setStudents(data);

    const initial: Record<string, boolean> = {};
    data.forEach((s: Student) => (initial[s.id] = true));
    setAttendance(initial);
    setAllAbsent(false);
  };

  /* -------------------- Toggle Student -------------------- */
  const toggleStudent = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* -------------------- Mark All -------------------- */
  const markAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    students.forEach((s) => (updated[s.id] = present));
    setAttendance(updated);
    setAllAbsent(!present);
  };

  /* -------------------- Submit -------------------- */
  const onSubmit = async (data: any) => {
    if (!students.length) {
      toast("No students loaded");
      return;
    }

    const payload = students.map((s) => ({
      studentId: s.id,
      classId: s.classId,
      date: data.date,
      present: attendance[s.id] ?? true,
    }));

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast("Attendance submitted successfully");

      // reset local state instead
      setStudents([]);
      setAttendance({});
      setAllAbsent(false);
    } catch {
      toast("Failed to submit attendance");
    }
  };

  /* ====================================================== */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
      {/* ---------------- Header ---------------- */}
      <h1 className="text-xl sm:text-2xl font-semibold dark:bg-[#121727] dark:text-gray-100">
        Mark Attendance
      </h1>

      {/* ---------------- Filters ---------------- */}
      <div className="bg-gray-50 dark:bg-[#121727] rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-mediu">Date</label>
            <input
              type="date"
              defaultValue={today}
              {...register("date")}
              className="w-full h-10 px-3 rounded-md 
               dark:bg-[#121727] dark:text-white 
               border 
               focus:outline-none focus:ring-2 focus:ring-LamaPurpleLight"
            />
          </div>

          {/* Admin Only */}
          {role === "admin" && (
            <>
              <div>
                <label className="text-sm font-medium">Grade</label>
                <select
                  onChange={(e) => setSelectedGrade(Number(e.target.value))}
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
              </div>

              <div>
                <label className="text-sm font-medium">Class</label>
                <select
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
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
              </div>
            </>
          )}

          {/* Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchStudents}
              className="w-full h-10 bg-green-700 hover:bg-green-600 text-white rounded-md"
            >
              Get Students
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Actions ---------------- */}
      {students.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="font-medium">Students: {students.length}</p>

          {allAbsent ? (
            <button
              type="button"
              onClick={() => markAll(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Mark All Present
            </button>
          ) : (
            <button
              type="button"
              onClick={() => markAll(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Mark All Absent
            </button>
          )}
        </div>
      )}

      {/* ---------------- Students Grid ---------------- */}
      {students.length > 0 && (
        <div className="max-h-[520px] overflow-y-auto border rounded-lg p-3 bg-white dark:bg-[#121727]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {students.map((s) => {
              const absent = !attendance[s.id];
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`rounded-lg p-3 text-left transition
                    ${
                      absent
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                    }
                    text-white`}
                >
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs mt-1">Adm No: {s.id}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- Submit ---------------- */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            Submit Attendance
          </button>
        </div>
      )}
    </form>
  );
}
