"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import { useEffect, useState } from "react";
import { Class, Grade, Student, AcademicYear } from "@prisma/client";
import { toast } from "react-toastify";
import { Users, ArrowRight, Loader2, GraduationCap } from "lucide-react";

export default function PromoteStudentsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<number>();
  const [toGrade, setToGrade] = useState<number>();
  const [fromClass, setFromClass] = useState<number>();
  const [toClass, setToClass] = useState<number>();
  const [newAcademicYear, setNewAcademicYear] =
    useState<AcademicYear>("Y2025_2026");

  const [fromClasses, setFromClasses] = useState<Class[]>([]);
  const [toClasses, setToClasses] = useState<Class[]>([]);

  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  /* ---------------- Load Grades (Sorted Once) ---------------- */
  useEffect(() => {
    fetch("/api/grades")
      .then((r) => r.json())
      .then((data: Grade[]) => {
        const sorted = data.sort((a, b) => a.id - b.id);
        setGrades(sorted);
      });
  }, []);

  /* ---------------- Auto Select Next Grade ---------------- */
  useEffect(() => {
    if (!selectedGrade || grades.length === 0) return;

    const index = grades.findIndex((g) => g.id === selectedGrade);

    if (index !== -1 && index < grades.length - 1) {
      setToGrade(grades[index + 1].id);
    } else {
      setToGrade(undefined);
    }
  }, [selectedGrade, grades]);

  /* ---------------- Load Classes ---------------- */
  useEffect(() => {
    if (!selectedGrade) return;

    fetch(`/api/classes?gradeId=${selectedGrade}`)
      .then((r) => r.json())
      .then(setFromClasses);
  }, [selectedGrade]);

  useEffect(() => {
    if (!toGrade) return;

    fetch(`/api/classes?gradeId=${toGrade}`)
      .then((r) => r.json())
      .then(setToClasses);
  }, [toGrade]);

  /* ---------------- Auto Match Same Section ---------------- */
  useEffect(() => {
    if (!fromClass || !toClasses.length) return;

    const fromSelected = fromClasses.find((c) => c.id === fromClass);
    if (!fromSelected) return;

    const sameSection = toClasses.find(
      (c) => c.section === fromSelected.section,
    );

    if (sameSection) {
      setToClass(sameSection.id);
    }
  }, [fromClass, toClasses]);

  /* ---------------- Load Students ---------------- */
  const loadStudents = async () => {
    if (!fromClass) return;

    setLoading(true);
    try {
      const data = await fetch(`/api/students?classId=${fromClass}`).then((r) =>
        r.json(),
      );

      setStudents(data);
      setSelectedStudents(data.map((s: Student) => s.id)); // auto-select all
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Promote ---------------- */
  const promoteStudents = async () => {
    if (!fromClass || !toClass || !selectedStudents.length) return;

    setPromoting(true);

    try {
      const res = await fetch("/api/student/promote-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudents,
          fromClassId: fromClass,
          toClassId: toClass,
          academicYear: newAcademicYear,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Students promoted successfully");
      setStudents([]);
    } catch {
      toast.error("Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const currentGradeName = grades.find((g) => g.id === selectedGrade)?.level;

  const nextGradeName = grades.find((g) => g.id === toGrade)?.level;

  const currentSection = fromClasses.find((c) => c.id === fromClass)?.section;

  const nextSection = toClasses.find((c) => c.id === toClass)?.section;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-darkMode p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-7 h-7 text-indigo-600" />
          Class Promotion
        </h1>
        <p className="text-zinc-500 mt-1">
          Promote students to the next class for the upcoming academic year
        </p>
      </div>

      {/* Filter Bar */}
      <div className="relative z-40 bg-white/70 dark:bg-darkMode backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 p-2 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-5 gap-3">
        <CustomSelect
          label="From Grade"
          icon={<GraduationCap className="w-4 h-4" />}
          value={selectedGrade}
          onChange={(val) => setSelectedGrade(Number(val))}
          placeholder="Select Grade"
          options={grades.map((g) => ({
            value: g.id,
            label: g.level,
          }))}
        />

        <CustomSelect
          label="From Section"
          icon={<Users className="w-4 h-4" />}
          value={fromClass}
          onChange={(val) => setFromClass(Number(val))}
          placeholder="Select Section"
          disabled={!selectedGrade}
          options={fromClasses.map((c) => ({
            value: c.id,
            label: `Section ${c.section}`,
          }))}
        />

        <CustomSelect
          label="To Grade"
          icon={<GraduationCap className="w-4 h-4" />}
          value={toGrade}
          onChange={(val) => setToGrade(Number(val))}
          placeholder="Next Grade"
          options={grades.map((g) => ({
            value: g.id,
            label: g.level,
          }))}
        />

        <CustomSelect
          label="To Section"
          icon={<Users className="w-4 h-4" />}
          value={toClass}
          onChange={(val) => setToClass(Number(val))}
          placeholder="Select Section"
          disabled={!toGrade}
          options={toClasses.map((c) => ({
            value: c.id,
            label: `Section ${c.section}`,
          }))}
        />

        {/* Academic Year + Load */}
        <CustomSelect
          label="Academic Year"
          icon={<GraduationCap className="w-4 h-4" />}
          value={newAcademicYear}
          onChange={(val) => setNewAcademicYear(val as AcademicYear)}
          options={[
            { value: "Y2024_2025", label: "2024-2025" },
            { value: "Y2025_2026", label: "2025-2026" },
            { value: "Y2026_2027", label: "2026-2027" },
          ]}
        />
      </div>

      <div className="flex justify-end items-center relative z-30">
        <button
          onClick={loadStudents}
          disabled={!selectedGrade || !fromClass || !toGrade || !toClass}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl shadow-lg font-medium transition"
        >
          {loading ? "Loading..." : "Load Students"}
        </button>
      </div>

      {/* Students Preview */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-8 space-y-6 relative z-10">
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Students to Promote</h2>

            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
              {students.length} Students
            </span>
          </div>

          {/* Table */}
          <div className="max-h-[420px] overflow-y-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-darkMode border-b">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </th>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Promotion</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => {
                  const isSelected = selectedStudents.includes(s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`border-t transition-colors ${
                        isSelected
                          ? "bg-indigo-50/40 dark:bg-zinc-800/40"
                          : "hover:bg-indigo-50/40 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(s.id)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                      </td>

                      <td className="p-4">{s.id}</td>
                      <td className="p-4">{s.name}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-600">
                            {currentGradeName} - {currentSection}
                          </span>

                          <ArrowRight className="w-4 h-4 text-zinc-400" />

                          <span className="font-semibold text-indigo-600">
                            {nextGradeName} - {nextSection}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={promoteStudents}
              disabled={promoting}
              className="
              bg-gradient-to-r from-emerald-600 to-emerald-700
              hover:from-emerald-500 hover:to-emerald-600
              text-white px-8 py-3 rounded-xl shadow-lg
              shadow-emerald-600/20
              hover:shadow-emerald-500/30
              transition-all duration-300
              flex items-center gap-2 font-medium
            "
            >
              {promoting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              Promote {selectedStudents.length} Students
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
