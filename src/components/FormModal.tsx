"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

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

// Dynamic form component imports
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <h1>Loading...</h1> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <h1>Loading...</h1> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <h1>Loading...</h1> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <h1>Loading...</h1> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <h1>Loading...</h1> });
const LessonsForm = dynamic(() => import("./forms/LessonsForm"), { loading: () => <h1>Loading...</h1> });
const AdminForm = dynamic(() => import("./forms/AdminForm"), { loading: () => <h1>Loading...</h1> });
const HomeworkForm = dynamic(() => import("./forms/HomeworkForm"), { loading: () => <h1>Loading...</h1> });
const FeesManagementForm = dynamic(() => import("./forms/FeesManagementForm"), { loading: () => <h1>Loading...</h1> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <h1>Loading...</h1> });
const MessagesForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <h1>Loading...</h1> });
const PermissionForm = dynamic(() => import("./forms/PermissionForm"), { loading: () => <h1>Loading...</h1> });

const forms: Record<
  string,
  (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any) => JSX.Element
> = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen, type, data, relatedData) => <LessonsForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  admin: (setOpen, type, data, relatedData) => <AdminForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  homework: (setOpen, type, data, relatedData) => <HomeworkForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  fees: (setOpen, type, data, relatedData) => <FeesManagementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  messages: (setOpen, type, data, relatedData) => <MessagesForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  permissions: (setOpen, type, data, relatedData) => <PermissionForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-LamaYellow"
      : type === "update"
        ? "bg-LamaSky"
        : "bg-LamaPurple";

  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const router = useRouter();

  const Form = () => {
    if (type === "delete" && id) {
      const handleDelete = async () => {
        try {
          const endpoint = deleteActionMap[table];
          if (!endpoint) return toast.error("Invalid delete target.");

          // ✅ Build URL correctly
          const url =
            ["student", "teacher", "admin"].includes(endpoint)
              ? `/api/users/${endpoint}s/${id}`
              : `/api/${endpoint}/${id}`;

          const res = await fetch(url, { method: "DELETE" });
          const result = await res.json();

          if (!res.ok || result.error) {
            toast.error(result.error || "Failed to delete.");
          } else {
            toast.success(`${capitalizeFirstLetter(table)} has been deleted!`);
            setOpen(false);
            router.refresh();
          }
        } catch (err) {
          console.error("Delete error:", err);
          toast.error("Something went wrong during deletion.");
        }
      };
      
    return (
      <div className="flex flex-col gap-4 p-4 text-black dark:text-white">
        <span className="font-medium text-center">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button
          onClick={handleDelete}
          className="self-center px-4 py-2 text-white bg-red-700 rounded-md w-max hover:bg-red-800 transition"
        >
          Delete
        </button>
      </div>
    );
  }

  if (type === "create" || type === "update") {
    return (
      <div className="space-y-4 text-black dark:text-white">
        {forms[table]?.(setOpen, type, data, relatedData) ?? <p>Form not found!</p>}
      </div>
    );
  }

  return <p className="text-black dark:text-white">Form not found!</p>;
};

return (
  <>
    <button
      className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
      onClick={() => setOpen(true)}
    >
      <img src={`/${type}.png`} alt="" width={16} height={16} />
    </button>

    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] shadow-lg">
          {/* Reset Button */}
          {(type === "create" || type === "update") && (
            <button
              type="button"
              onClick={() => setFormKey(Date.now())}
              className="absolute top-4 left-4 text-black dark:text-white"
              title="Reset"
            >
              <img src="/reset.png" alt="Reset" width={14} height={14} />
            </button>
          )}

          {/* Close Button */}
          <div
            className="absolute cursor-pointer top-4 right-4"
            onClick={() => setOpen(false)}
          >
            <img src="/close.png" alt="Close" width={14} height={14} />
          </div>

          {/* Form Container */}
          <div
            key={formKey}
            className="mt-10 space-y-4"
          >
            <div className="space-y-4">
              <Form />
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default FormModal;
