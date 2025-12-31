"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronDown,
  Maximize2,
  Minimize2,
  Search,
  LayoutGrid,
} from "lucide-react";

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
    setIsFullScreen(!isFullScreen);
  };

  // --- UI Components ---

  return (
    <div
      className={`flex flex-col bg-gray-50 dark:bg-darkMode text-zinc-900 dark:text-zinc-100 transition-all duration-300 ${
        isFullScreen
          ? "fixed inset-0 z-[100] h-screen w-screen"
          : "relative min-h-[calc(100vh-4rem)] w-full"
      }`}
    >
      {/* 1. Glassmorphism Header */}
      <header className="bg-white/80 dark:bg-darkMode/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm px-6 py-4 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <LayoutGrid className="w-5 h-5" />
              </span>
              Marks Entry
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-14 font-medium">
              Manage results for {exams.length > 0 ? "Term Exams" : "Assessments"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
              System Active
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all active:scale-95 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 dark:bg-darkMode gap-4 w-full p-1">
          <SelectBox
            label="Exam"
            icon={<CheckCircle2 className="w-4 h-4" />}
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
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-6 overflow-hidden flex flex-col">
        {/* State: Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Fetching marks sheet...
            </p>
          </div>
        )}

        {/* State: Empty / Prompt */}
        {!loading && students.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-darkMode mt-2 min-h-[400px]">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Filter className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Ready to Grade
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm text-center">
              Please select an Exam, Grade, and Section from the toolbar above to generate the marks sheet.
            </p>
          </div>
        )}

        {/* State: Data Table */}
        {!loading && students.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden mt-2 relative animate-in slide-in-from-bottom-4 duration-500">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                {/* Sticky Header */}
                <thead className="text-xs font-bold uppercase tracking-wider bg-zinc-50/95 dark:bg-darkMode text-zinc-500 dark:text-zinc-400 sticky top-0 z-20 backdrop-blur-md shadow-sm">
                  <tr>
                    {/* Sticky Column Header */}
                    <th
                      scope="col"
                      className="sticky left-0 z-30 bg-zinc-50/95 dark:bg-darkMode px-6 py-4 border-b border-r border-zinc-200 dark:border-zinc-800 w-64 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] text-left"
                    >
                      Student Details
                    </th>
                    {subjects.map((subj) => (
                      <th
                        key={subj.id}
                        className="px-4 py-4 border-b border-zinc-200 dark:darkMode min-w-[140px] text-center"
                      >
                        {subj.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="group hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors duration-150 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                    >
                      {/* Sticky Student Name Column */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-darkMode group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/5 px-6 py-3 border-r border-zinc-200 dark:border-zinc-800 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wide text-zinc-400 mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                            ID: {student.id.slice(-6)}
                          </span>
                        </div>
                      </td>

                      {/* Marks Inputs */}
                      {subjects.map((subj) => {
                        const currentMark =
                          marksData.find((d) => d.studentId === student.id)
                            ?.marks[subj.name] || "";
                        return (
                          <td key={subj.id} className="p-2 relative">
                            <input
                              type="number"
                              step="any"
                              value={currentMark}
                              onChange={(e) =>
                                handleMarkChange(
                                  student.id,
                                  subj.name,
                                  e.target.value
                                )
                              }
                              className={`
                                w-full h-10 text-center rounded-lg 
                                border border-zinc-200 dark:border-zinc-700
                                bg-transparent
                                text-zinc-700 dark:text-zinc-200
                                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                                focus:bg-white dark:focus:bg-[#09090b]
                                focus:outline-none 
                                transition-all duration-200 font-mono text-sm font-medium
                                shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700
                                ${
                                  currentMark
                                    ? "font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-800"
                                    : ""
                                }
                              `}
                            />
                            {/* Visual Indicator for Filled Data */}
                            {currentMark && (
                              <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full pointer-events-none opacity-40"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Floating Footer Action Bar */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-darkMode backdrop-blur-xl p-4 sticky bottom-0 z-40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-darkMode px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                <span>
                  Changes are local until you click <strong>Submit</strong>.
                </span>
              </div>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to submit?"))
                    handleSubmit();
                }}
                disabled={submitting}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {submitting ? "Saving..." : "Submit Results"}
              </button>
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
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
      {icon}
    </div>
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
      <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
    </div>
    <select
      className={`
        w-full appearance-none pl-10 pr-10 py-3 
        bg-white dark:bg-darkMode
        border border-zinc-200 dark:border-zinc-800 
        rounded-xl text-sm font-medium
        text-zinc-700 dark:text-zinc-200 
        focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
        outline-none transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700
        disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-900
        shadow-sm
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