"use client";

import React, { useEffect, useState } from "react";
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
  BookOpen
} from "lucide-react";
import DesktopMarksTable from "@/components/DesktopMarksTable";
import MobileMarksCards from "@/components/MobileMarksCards";

// --- Types ---
type Exam = { id: number; title: string };
type Grade = { id: number; level: string };
type Class = { id: number; section: string };
type Subject = { id: number; name: string };
type Student = { id: string; name: string };

// --- Interfaces ---
interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function MarksEntryForm() {
  // --- State ---
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selections
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<number>();
  const [selectedGradeId, setSelectedGradeId] = useState<number>();
  const [selectedClassId, setSelectedClassId] = useState<number>();

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [marksData, setMarksData] = useState<
    { studentId: string; marks: { [subjectName: string]: string } }[]
  >([]);

  // --- Effects ---

  // 1. Initial Load
  useEffect(() => {
    const initFetch = async () => {
      try {
        const [examRes, gradeRes] = await Promise.all([
          axios.get("/api/exams"),
          axios.get("/api/grades"),
        ]);
        setExams(examRes.data.exams || []);
        setGrades(gradeRes.data || []);
      } catch (error) {
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
    if (!selectedExamTitle || !selectedGradeId || !selectedClassId) return;

    const fetchExamData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/exams/exam-data", {
          params: {
            examTitle: selectedExamTitle,
            gradeId: selectedGradeId,
            classId: selectedClassId,
          },
        });

        setSelectedExamId(res.data.examId);
        setSubjects(res.data.subjects);
        setStudents(res.data.students);

        const initialMarks = res.data.students.map((student: Student) => ({
          studentId: student.id,
          marks: res.data.existingMarks?.[student.id] || {},
        }));
        setMarksData(initialMarks);
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
    value: string
  ) => {
    setMarksData((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? { ...entry, marks: { ...entry.marks, [subjectName]: value } }
          : entry
      )
    );
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
            console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
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
      className={`flex flex-col bg-gray-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 ${
        isFullScreen ? "h-screen w-screen" : "min-h-[calc(100vh-4rem)] w-full"
      }`}
    >
      {/* 1. Glassmorphism Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 md:sticky top-0 z-40 px-4 md:px-6 py-4">
        {/* REMOVED: max-w-7xl mx-auto */}
        <div className="w-full"> 
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                <span className="p-2 bg-indigo-600 dark:bg-indigo-500 rounded-lg text-white shadow-md shadow-indigo-500/20">
                    <LayoutGrid className="w-5 h-5" />
                </span>
                Marks Entry
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-12 font-medium">
                Manage results for {exams.length > 0 ? "Term Exams" : "Assessments"}
                </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                System Active
                </div>

                <button
                onClick={toggleFullScreen}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                >
                {isFullScreen ? (
                    <Minimize2 className="w-5 h-5" />
                ) : (
                    <Maximize2 className="w-5 h-5" />
                )}
                </button>
                
                {students.length > 0 && (
                    <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Save Marks</span>
                    </button>
                )}
            </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <SelectBox
                label="Exam"
                icon={<BookOpen className="w-4 h-4" />}
                value={selectedExamTitle || ""}
                onChange={(e) => setSelectedExamTitle(e.target.value)}
                placeholder="Select Exam..."
                options={exams.map((e) => ({ value: e.title, label: e.title }))}
            />
            <SelectBox
                label="Grade"
                icon={<Filter className="w-4 h-4" />}
                value={selectedGradeId || ""}
                onChange={(e) => setSelectedGradeId(Number(e.target.value))}
                placeholder="Select Grade..."
                options={grades.map((g) => ({ value: g.id, label: g.level }))}
            />
            <SelectBox
                label="Section"
                icon={<Search className="w-4 h-4" />}
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                placeholder="Select Section..."
                disabled={!selectedGradeId}
                options={classes.map((c) => ({ value: c.id, label: c.section }))}
            />
            </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      {/* REMOVED: max-w-7xl mx-auto */}
      <main className="flex-1 w-full p-4 md:p-6 overflow-hidden flex flex-col"> 
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Fetching students & marks data...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="p-4 bg-white dark:bg-black rounded-full shadow-sm mb-4">
                    <Filter className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No Data Loaded</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
                    Select an Exam, Grade, and Section from the filters above to load the marks sheet.
                </p>
            </div>
        )}

        {/* Data View */}
        {!loading && students.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            {/* Mobile View */}
            <div className="block lg:hidden overflow-y-auto pb-20">
              <MobileMarksCards
                students={students}
                subjects={subjects}
                marksData={marksData}
                onChange={handleMarkChange}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex flex-1 overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm bg-white dark:bg-black">
              <DesktopMarksTable
                students={students}
                subjects={subjects}
                marksData={marksData}
                onChange={handleMarkChange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Modern Select Component ---
const SelectBox = ({
  label,
  options,
  className,
  placeholder,
  icon,
  ...props
}: SelectBoxProps) => (
  <div
    className={`relative group ${
      props.disabled ? "opacity-60 cursor-not-allowed" : ""
    }`}
  >
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors z-10">
      {icon}
    </div>
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400 z-10">
      <ChevronDown className="w-4 h-4" />
    </div>
    <select
      className={`
        w-full appearance-none pl-10 pr-10 py-2.5 
        bg-white dark:bg-black
        border-none outline-none
        rounded-lg text-sm font-medium
        text-zinc-700 dark:text-zinc-200 
        focus:ring-2 focus:ring-indigo-500/20 
        transition-all cursor-pointer 
        disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-900
        ${className || ""}
      `}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);