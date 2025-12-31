"use client";

import { useState, useRef, DragEvent } from "react";
import Papa from "papaparse";
import axios from "axios";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  Trash2,
  FileText,
  BookOpen // Changed icon to represent Lessons
} from "lucide-react";

type LessonCSV = {
  gradeId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  period: string;
};

export default function BulkLessonsUpload() {
  const [lessons, setLessons] = useState<LessonCSV[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setLessons([]);
    setErrors([]);
    setSuccess(false);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setSuccess(false);
    setErrors([]);

    Papa.parse<LessonCSV>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data as LessonCSV[];
        const err: string[] = [];

        parsed.forEach((row, index) => {
          const missing: string[] = [];
          if (!row.gradeId) missing.push("gradeId");
          if (!row.classId) missing.push("classId");
          if (!row.subjectId) missing.push("subjectId");
          if (!row.teacherId) missing.push("teacherId");
          if (!row.day) missing.push("day");
          if (!row.period) missing.push("period");

          if (missing.length > 0) {
            err.push(`Row ${index + 2}: missing ${missing.join(", ")}`);
          }
        });

        setErrors(err);
        setLessons(parsed);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/lessons/bulk", {
        lessons,
      });

      if (!response.data.errors?.length) {
        setSuccess(true);
        setTimeout(() => resetForm(), 3000); 
      } else {
        setErrors(response.data.errors);
      }
    } catch (err) {
      console.error(err);
      setErrors(["Network error: Failed to upload data to the server."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      
      {/* 1. Header Section */}
      <header className="px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-indigo-600 dark:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            Bulk Lessons Import
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
            Schedule multiple lessons at once by uploading a CSV.
          </p>
        </div>
        
        <button 
          onClick={() => window.open('/sample/lessons-bulk-template.csv')} 
          className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700">
             <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Download Template
          </span>
        </button>
      </header>

      {/* 2. Main Content - Expanded Width */}
      <main className="flex-1 px-4 md:px-10 pb-10">
        <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* A. Empty State / Drop Zone */}
          {!lessons.length && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16">
              <div
                className={`relative group cursor-pointer flex flex-col items-center justify-center w-full max-w-3xl h-80 rounded-3xl border-3 border-dashed transition-all duration-300 ease-out
                  ${dragActive 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/10" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {/* Decorative Icon Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                   <div className="w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6 text-center p-6">
                  <div className={`p-5 rounded-2xl shadow-sm transition-all duration-300 ${dragActive ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-500 group-hover:scale-110'}`}>
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                      Upload Lessons Schedule
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Drag and drop your file here, or click to browse. Supports standard .csv formatting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. Data Review Interface */}
          {lessons.length > 0 && (
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate max-w-[300px]">
                      {fileName}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {lessons.length} Lessons Found
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Discard</span>
                  </button>
                </div>
              </div>

              {/* Validation & Success Banners */}
              <div className="px-6 pt-6 space-y-4">
                {errors.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Import Validation Failed</h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-2">Please fix the following issues in your CSV file:</p>
                      <ul className="text-xs text-red-700 dark:text-red-400 list-disc list-inside space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                    <button onClick={() => setErrors([])} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                  </div>
                )}

                {success && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Import Successful</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Your lessons have been successfully scheduled.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Large Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 sticky top-0 z-10 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 w-16 text-center">#</th>
                        {Object.keys(lessons[0]).map((key) => (
                          <th key={key} className="px-6 py-4">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-[#18181b]">
                      {lessons.map((lesson, i) => (
                        <tr key={i} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                          <td className="px-6 py-3 text-center text-zinc-400 font-mono text-xs border-r border-transparent group-hover:border-indigo-100 dark:group-hover:border-zinc-800">{i + 1}</td>
                          {Object.values(lesson).map((val, j) => (
                            <td key={j} className="px-6 py-3 font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                              {val ? (
                                <span>{val}</span>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-600 italic text-xs">Empty</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Sticky Footer */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] flex justify-end gap-3 sticky bottom-0 z-20">
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || errors.length > 0}
                  className="px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      Import {lessons.length} Lessons
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}