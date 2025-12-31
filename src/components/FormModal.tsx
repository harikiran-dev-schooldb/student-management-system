"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  Loader2 
} from "lucide-react";

// Mapping logical table names to API routes
const deleteActionMap: Record<string, string> = {
  subject: "subject",
  class: "classes",
  teacher: "teacher",
  student: "student",
  exam: "exam",
  lesson: "subject",
  assignment: "subject",
  attendance: "subject",
  event: "subject",
  announcement: "announcement",
  fees: "fees",
  fees_structure: "fees",
  homework: "homework",
  admin: "admin",
  messages: "messages",
  permissions: "permissions",
};

// Dynamic form imports (kept as is)
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <LoadingSpinner /> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <LoadingSpinner /> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <LoadingSpinner /> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <LoadingSpinner /> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <LoadingSpinner /> });
const LessonsForm = dynamic(() => import("./forms/LessonsForm"), { loading: () => <LoadingSpinner /> });
const AdminForm = dynamic(() => import("./forms/AdminForm"), { loading: () => <LoadingSpinner /> });
const HomeworkForm = dynamic(() => import("./forms/HomeworkForm"), { loading: () => <LoadingSpinner /> });
const FeesManagementForm = dynamic(() => import("./forms/FeesManagementForm"), { loading: () => <LoadingSpinner /> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <LoadingSpinner /> });
const MessagesForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <LoadingSpinner /> });
const PermissionForm = dynamic(() => import("./forms/PermissionForm"), { loading: () => <LoadingSpinner /> });

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-gray-400" size={32} />
  </div>
);

const forms: Record<string, any> = {
  subject: (setOpen: any, type: any, data: any, relatedData: any) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen: any, type: any, data: any, relatedData: any) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen: any, type: any, data: any, relatedData: any) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen: any, type: any, data: any, relatedData: any) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen: any, type: any, data: any, relatedData: any) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen: any, type: any, data: any, relatedData: any) => <LessonsForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  admin: (setOpen: any, type: any, data: any, relatedData: any) => <AdminForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  homework: (setOpen: any, type: any, data: any, relatedData: any) => <HomeworkForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  fees: (setOpen: any, type: any, data: any, relatedData: any) => <FeesManagementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen: any, type: any, data: any, relatedData: any) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  messages: (setOpen: any, type: any, data: any, relatedData: any) => <MessagesForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  permissions: (setOpen: any, type: any, data: any, relatedData: any) => <PermissionForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

function ResponsiveModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div
        className="
          relative z-10 
          w-full md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]
          bg-white dark:bg-[#121727] dark:border dark:border-gray-800
          rounded-t-2xl md:rounded-xl
          shadow-2xl
          max-h-[90vh] overflow-y-auto
          animate-in slide-in-from-bottom-10 fade-in duration-200
        "
      >
        {children}
      </div>
    </div>
  );
}

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Button Styles Configuration ---
  const buttonConfig = {
    create: {
      icon: <Plus size={20} />,
      className: "w-8 h-8 rounded-full bg-LamaBlue hover:bg-amber-500 text-white dark:text-white transition-colors",
      label: "Create",
    },
    update: {
      icon: <Pencil size={16} />,
      className: "w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors",
      label: "Edit",
    },
    delete: {
      icon: <Trash2 size={16} />,
      className: "w-7 h-7 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900 transition-colors",
      label: "Delete",
    },
  };

  const selectedConfig = buttonConfig[type];

  // --- Delete Handler ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      const endpoint = deleteActionMap[table];
      if (!endpoint) return toast.error("Invalid delete target.");

      const url = ["student", "teacher", "admin"].includes(endpoint)
        ? `/api/users/${endpoint}s/${id}`
        : `/api/${endpoint}/${id}`;

      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Failed to delete.");
      } else {
        toast.success(`${capitalizeFirstLetter(table)} deleted successfully.`);
        setOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // --- Form Renderer ---
  const FormContent = () => {
    // 1. Delete View
    if (type === "delete" && id) {
      return (
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle size={24} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete {capitalizeFirstLetter(table)}?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              This action cannot be undone. This will permanently delete this record from the database.
            </p>
          </div>

          <div className="flex gap-3 w-full justify-center pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      );
    }

    // 2. Create/Update View
    if (type === "create" || type === "update") {
      return (
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {type === "create" ? "Add New" : "Update"} {capitalizeFirstLetter(table)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormKey(Date.now())}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Reset Form"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div key={formKey}>
              {forms[table]?.(setOpen, type, data, relatedData) ?? (
                <div className="text-center py-10 text-gray-500">Form not found for {table}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return <div className="p-6 text-center">Form type not supported.</div>;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className={`${selectedConfig.className} flex items-center justify-center`}
        onClick={() => setOpen(true)}
        title={selectedConfig.label}
      >
        {selectedConfig.icon}
      </button>

      {/* Modal Wrapper */}
      <ResponsiveModal open={open} onClose={() => setOpen(false)}>
        <FormContent />
      </ResponsiveModal>
    </>
  );
};

export default FormModal;