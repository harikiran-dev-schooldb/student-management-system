"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Filter,
  ChevronDown,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Save,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
} from "lucide-react";
import DesktopMarksTable from "@/components/DesktopMarksTable";
import MobileMarksCards from "@/components/MobileMarksCards";

// --- Types & Interfaces ---
type Exam = { id: number; title: string };
type Grade = { id: number; level: string };
type Class = { id: number; section: string };
type Subject = { id: number; name: string };
type Student = { id: string; name: string };

interface CustomSelectProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function MarksEntryForm() {
  // --- State ---
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [role, setRole] = useState<"admin" | "teacher">("admin");
  const [teacherClassId, setTeacherClassId] = useState<number>();
  const [teacherGradeId, setTeacherGradeId] = useState<number>();

  // Selections
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<number>();
  const [selectedGradeId, setSelectedGradeId] = useState<number>();
  const [selectedClassId, setSelectedClassId] = useState<number>();

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [marksData, setMarksData] = useState<
    { studentId: string; marks: { [subjectName: string]: string } }[]
  >([]);

  // --- Effects ---

  // 1. Initial Load
  useEffect(() => {
    const initFetch = async () => {
      try {
        const userRes = await axios.get("/api/users/me");
        const { role, classId, gradeId } = userRes.data;

        setRole(role);

        if (role === "teacher") {
          setTeacherClassId(classId);
          setTeacherGradeId(gradeId); // if your API provides it
          setSelectedClassId(classId);
          setSelectedGradeId(gradeId);
        }

        const [examRes, gradeRes] = await Promise.all([
          axios.get("/api/exams").catch(() => ({ data: { exams: [] } })),
          axios.get("/api/grades").catch(() => ({ data: [] })),
        ]);

        setExams(examRes.data.exams || []);
        setGrades(gradeRes.data || []);
      } catch {
        toast.error("Failed to load initial data");
      }
    };

    initFetch();
  }, []);

  // 2. Fetch Classes
  useEffect(() => {
    if (!selectedGradeId) {
      setClasses([]);
      setSelectedClassId(undefined);
      return;
    }
    axios
      .get(`/api/classes?gradeId=${selectedGradeId}`)
      .then((res) => setClasses(res.data))
      .catch(() => toast.error("Could not load sections"));
  }, [selectedGradeId]);

  // 3. Fetch Grid Data
  useEffect(() => {
    if (!selectedExamTitle) return;

    if (role === "admin" && (!selectedGradeId || !selectedClassId)) return;

    if (role === "teacher" && !teacherClassId) return;

    const fetchExamData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/exams/exam-data", {
          params: {
            examTitle: selectedExamTitle,
            gradeId: role === "teacher" ? teacherGradeId : selectedGradeId,
            classId: role === "teacher" ? teacherClassId : selectedClassId,
          },
        });

        console.log("EXAM PARAMS", {
          role,
          selectedExamTitle,
          selectedGradeId,
          selectedClassId,
          teacherGradeId,
          teacherClassId,
        });

        setSelectedExamId(res.data.examId);
        setSubjects(res.data.subjects);
        setStudents(res.data.students);

        const initialMarks = res.data.students.map((student: Student) => ({
          studentId: student.id,
          marks: res.data.existingMarks?.[student.id] || {},
        }));
        setMarksData(initialMarks);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch marks sheet");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [selectedExamTitle, selectedGradeId, selectedClassId]);

  // --- Handlers ---

  const handleMarkChange = (
    studentId: string,
    subjectName: string,
    value: string,
  ) => {
    setMarksData((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? { ...entry, marks: { ...entry.marks, [subjectName]: value } }
          : entry,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !selectedGradeId)
      return toast.warning("Please select all filters first.");

    setSubmitting(true);
    const payload = {
      gradeId: selectedGradeId,
      examId: selectedExamId,
      entries: marksData,
    };

    try {
      await axios.post("/api/results/bulk-entry", payload);
      toast.success("Marks submitted successfully!");
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit marks");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${e.message}`,
        );
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // --- Render ---

  return (
    <div
      className={`flex flex-col bg-zinc-50 dark:bg-darkMode text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${
        isFullScreen
          ? "h-screen w-screen overflow-hidden"
          : "min-h-screen w-full"
      }`}
    >
      {/* Decorative Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[10%] right-[0%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* 1. Header & Filters Section */}
      <header className="relative z-20 flex-none px-4 md:px-8 py-6 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Marks Entry
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                Academic Year 2024-2025
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                Term 2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Full Screen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-lg bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            {/* NEW: Combined Actions & Stats Group */}
            {students.length > 0 && (
              <div className="flex items-center gap-4 pl-4 ml-1 border-l border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Dynamic Save Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasUnsavedChanges}
                  className={`
          relative group flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
          ${
            hasUnsavedChanges
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-emerald-50 dark:bg-darkMode text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default"
          }
        `}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : !hasUnsavedChanges ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}

                  <span>
                    {submitting
                      ? "Saving..."
                      : hasUnsavedChanges
                      ? "Save Changes"
                      : "All Saved"}
                  </span>

                  {/* Optional: Visual ping when there are unsaved changes */}
                  {hasUnsavedChanges && !submitting && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Filter Bar */}
        <div className="bg-white/70 dark:bg-darkMode backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 p-1.5 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 grid grid-cols-1 md:grid-cols-3 gap-2">
          <CustomSelect
            label="Examination"
            icon={<BookOpen className="w-4 h-4" />}
            value={selectedExamTitle}
            onChange={(val) => setSelectedExamTitle(val)}
            placeholder="Select Exam"
            options={exams.map((e) => ({ value: e.title, label: e.title }))}
          />
          {role === "admin" && (
            <>
              <CustomSelect
                label="Grade Level"
                icon={<GraduationCap className="w-4 h-4" />}
                value={selectedGradeId}
                onChange={(val) => setSelectedGradeId(Number(val))}
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
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 relative z-10 w-full px-4 md:px-8 pb-24 overflow-hidden flex flex-col">
        {/* Content Container */}
        <div className="flex-1 rounded-2xl bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800/50 shadow-sm overflow-hidden flex flex-col relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-darkMode backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                Retrieving student records...
              </p>
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-darkMode rounded-full flex items-center justify-center mb-6">
                <Filter className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-gray-500">
                Ready to Grade
              </h3>
              <p className="text-zinc-500 max-w-sm mt-2">
                Use the filters above to load the mark sheet for a specific
                class and exam.
              </p>
            </div>
          )}

          {!loading && students.length > 0 && (
            <div className="flex-1 h-full overflow-hidden flex flex-col animate-in fade-in duration-500">
              {/* Desktop: Table | Mobile: Cards */}
              <div className="flex-1 overflow-auto">
                <div className="hidden lg:block h-full">
                  <DesktopMarksTable
                    students={students}
                    subjects={subjects}
                    marksData={marksData}
                    onChange={handleMarkChange}
                  />
                </div>
                <div className="block lg:hidden h-full p-4">
                  <MobileMarksCards
                    students={students}
                    subjects={subjects}
                    marksData={marksData}
                    onChange={handleMarkChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
           ${
             isOpen ? "ring-2 ring-indigo-500/20 bg-white dark:bg-darkMode" : ""
           }
         `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`
             p-2 rounded-lg transition-colors
             ${
               value
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
              className={`text-sm font-semibold truncate ${
                value ? "text-zinc-900 dark:text-white" : "text-zinc-400"
              }`}
            >
              {selectedLabel || placeholder}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 w-full max-h-60 overflow-y-auto bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
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
                   ${
                     String(value) === String(opt.value)
                       ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
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
