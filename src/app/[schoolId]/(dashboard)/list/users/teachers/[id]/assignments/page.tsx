"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  BookOpen,
  Layers,
  Save,
  Loader2,
  Filter,
} from "lucide-react";
import { tenantFetch } from "@/lib/tenantFetch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

// TYPES
interface Grade {
  id: number;
  level: string;
}

interface Subject {
  id: number;
  name: string;
  grades: Grade[]; // Array of grades this subject belongs to
}

interface Class {
  id: number;
  name: string;
  gradeId: number; // Vital for linking
}

interface Assignment {
  subjectId: number;
  classId: number;
  subject: Subject;
  class: Class;
}

export default function TeacherAssignmentsPage() {
  const params = useParams<{ schoolId: string; id: string }>();
  const teacherId = params.id;
  const schoolId = params.schoolId;
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data Store
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  // Form Selections
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    subjectId: number;
    classId: number;
  } | null>(null);

  // 1. FETCH INITIAL DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);

        // A. Assignments
        const assignData = await tenantFetch<Assignment[]>(
          schoolId,
          `/users/teachers/${teacherId}/subjects`,
        );
        setAssignments(assignData);

        const classData = await tenantFetch<Class[]>(schoolId, `/classes`);
        setAllClasses(classData);

        const subjectData = await tenantFetch<Subject[]>(schoolId, `/subjects`);
        setAllSubjects(subjectData);

        // DEBUGGING: Check Console to see if data has the right structure
        console.log("Classes Loaded:", classData);
        console.log("Subjects Loaded:", subjectData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  // 2. FILTER LOGIC
  const availableSubjects = useMemo(() => {
    if (!selectedClassId) return [];

    // Find the selected Class
    const selectedClass = allClasses.find(
      (c) => c.id === Number(selectedClassId),
    );

    // DEBUGGING: Check what class was found
    if (!selectedClass) {
      console.log("Class not found in state");
      return [];
    }
    if (!selectedClass.gradeId) {
      console.warn(
        "Selected Class is missing 'gradeId'. This is required for filtering subjects.",
        selectedClass,
      );
      return [];
    }

    // Filter Subjects
    const filtered = allSubjects.filter((subject) =>
      subject.grades?.some((g) => g.id === selectedClass.gradeId),
    );

    console.log(
      `Filtering for Grade ID: ${selectedClass.gradeId}. Found ${filtered.length} subjects.`,
    );
    return filtered;
  }, [selectedClassId, allClasses, allSubjects]);

  // Reset subject if class changes
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedClassId]);

  // 3. HANDLER: ASSIGN
  const handleAssign = async () => {
    if (!selectedClassId || !selectedSubjectId || !teacherId) return;

    const exists = assignments.find(
      (a) =>
        a.classId === Number(selectedClassId) &&
        a.subjectId === Number(selectedSubjectId),
    );

    if (exists) {
      alert("This subject is already assigned to this teacher for this class.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        assignments: [
          {
            classId: Number(selectedClassId),
            subjectId: Number(selectedSubjectId),
          },
        ],
      };

      await tenantFetch(
        schoolId,
        `/users/teachers/${teacherId}/subjects`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const refreshData = await tenantFetch<Assignment[]>(
        schoolId,
        `/users/teachers/${teacherId}/subjects`
      );

      setAssignments(refreshData);
      setSelectedSubjectId("");

    } catch (error) {
      console.error(error);
      alert("Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  // 4. HANDLER: REMOVE
  const handleRemove = (sId: number, cId: number) => {
    setDeleteItem({ subjectId: sId, classId: cId });
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    const { subjectId, classId } = deleteItem;

    const previous = [...assignments];

    setAssignments((prev) =>
      prev.filter(
        (a) => !(a.subjectId === subjectId && a.classId === classId)
      )
    );

    try {
      await tenantFetch(
        schoolId,
        `/users/teachers/${teacherId}/subjects?subjectId=${subjectId}&classId=${classId}`,
        { method: "DELETE" }
      );
    } catch (error) {
      console.error(error);
      setAssignments(previous);
    } finally {
      setDeleteItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading academic data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Allocations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subject mappings based on class grades.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition flex items-center"
        >
          &larr; Back to Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Add Assignment
            </h2>

            <div className="space-y-5">
              {/* Class Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span className="flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-gray-400" /> Class
                  </span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all"
                >
                  <option value="">Select a Class...</option>
                  {allClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" /> Subject
                  </span>
                  {selectedClassId && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center">
                      <Filter className="w-3 h-3 mr-1" />
                      Filtered by Grade
                    </span>
                  )}
                </label>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={!selectedClassId}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">
                    {!selectedClassId
                      ? "Select Class first..."
                      : availableSubjects.length === 0
                        ? "No subjects found for this grade"
                        : "Select a Subject..."}
                  </option>
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssign}
                disabled={saving || !selectedClassId || !selectedSubjectId}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              How this works
            </h3>
            <p className="text-xs text-blue-600 leading-relaxed">
              Subjects are linked to Grades. Selecting a class filters subjects
              by checking if the subject supports the class's grade level.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Current Schedule</h2>
              <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                {assignments.length} Mappings
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {assignments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                  <Layers className="w-12 h-12 mb-3 opacity-20" />
                  <p>No subjects assigned yet.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Class</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignments.map((item) => (
                      <tr
                        key={`${item.classId}-${item.subjectId}`}
                        className="group hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                              {item.class.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.subject.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemove(item.subjectId, item.classId)}
                            disabled={deletingKey === `${item.subjectId}-${item.classId}`}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingKey === `${item.subjectId}-${item.classId}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Assignment</DialogTitle>

                  <DialogDescription>
                    Are you sure you want to remove this subject from the teacher?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteItem(null)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
