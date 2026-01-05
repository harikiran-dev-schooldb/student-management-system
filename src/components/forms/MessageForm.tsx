"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { z } from "zod"; // Import z here directly if needed or keep using your lib
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";


const useApiRequest = () => {
  const makeRequest = async (url: string, method: string, body: any) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Something went wrong");
      return data;
    } catch (error: any) {
      throw new Error(error.message || "API request failed");
    }
  };
  return { makeRequest };
};

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const [state, setState] = useState<{ success: boolean; error: boolean }>({
    success: false,
    error: false,
  });

  const [studentName, setStudentName] = useState("");
  const [Class, setClass] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: data?.title || "", // 🆕 Load existing title if update
      date: data?.date || new Date().toISOString().slice(0, 10),
      classId: data?.classId || "",
      message: data?.message || "",
      type: data?.type || "",
      studentId: data?.studentId || "",
      gradeId: data?.gradeId || "",
    },
  });

  const selectedGradeId = watch("gradeId");
  const selectedClassId = watch("classId");
  const selectedType = watch("type");

  const router = useRouter();
  const { makeRequest } = useApiRequest();
  const { classes = [], grades = [], students = [] } = relatedData || {};

  // Filters
  const filteredClasses = selectedGradeId
    ? classes.filter((cls: any) => cls.gradeId === Number(selectedGradeId))
    : classes;

  const filteredStudents = selectedClassId
    ? students.filter((std: any) => std.classId === Number(selectedClassId))
    : [];

  // Reset student when grade changes
  useEffect(() => {
    setValue("studentId", "");
  }, [selectedGradeId, setValue]);

  // Handle Success
  useEffect(() => {
    if (state.success) {
      toast.success(`Message ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  // Auto-generate message content
  useEffect(() => {
    // Only auto-generate if message is empty to avoid overwriting user edits
    if (!watch("message")) {
       const generatedMessage = getMessageContent(selectedType, {
        name: studentName,
        className: Class,
      });
      setValue("message", generatedMessage);
    }
  }, [studentName, Class, selectedType, setValue, watch]);

  const onSubmit = handleSubmit(async (formData) => {
    if (type === "update" && !data?.id) {
      toast.error("Missing message ID for update.");
      return;
    }

    try {
      // 2. CONSTRUCT PAYLOAD
      // -------------------------------------------------------
      const payload = {
        title: formData.title, // 🆕 Send Title
        message: formData.message,
        type: formData.type,
        date: formData.date,
        // Only send IDs if they have values
        studentId: formData.studentId || null, 
        classId: formData.classId || null,
        
        // ⚠️ Remove gradeId (it's not in the DB model)
        // 🆕 Add isRead default
        isRead: false, 
        // 🆕 Add generic data for manual messages (optional)
        data: { screen: "NotificationScreen" } 
      };

      const url = type === "create" ? "/api/message" : `/api/message/${data.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const result = await makeRequest(url, method, payload);
      setState({ success: result.success, error: !result.success });
    } catch (error: any) {
      setState({ success: false, error: true });
      toast.error(`Error: ${error.message}`);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Notification" : "Update Notification"}
      </h1>

      {/* 🆕 TITLE INPUT */}
      <InputField
        label="Title"
        name="title"
        register={register}
        error={errors?.title}
        placeholder="e.g. Homework Update or Fee Reminder"
      />

      <div className="flex justify-between gap-4">
        {/* Date Input */}
        <div className="w-full">
            <InputField label="Date" name="date" type="date" register={register} error={errors?.date} />
        </div>

        {/* Type Select */}
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-500">Type</label>
            <select
            {...register("type")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
            <option value="">Select Type</option>
            <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
            <option value="GENERAL">GENERAL</option>
            <option value="HOMEWORK">HOMEWORK</option>
            <option value="EVENT">EVENT</option>
            <option value="FEE_RELATED">FEE RELATED</option>
            <option value="EXAM_RESULT">EXAM RESULT</option>
            </select>
            {errors?.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Grade Select (Filter Only) */}
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-500">Grade (Filter)</label>
            <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
            >
            <option value="">Select Grade</option>
            {grades.map((gr: any) => (
                <option key={gr.id} value={gr.id}>{gr.level}</option>
            ))}
            </select>
        </div>

        {/* Class Select */}
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-500">Class</label>
            <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
            >
            <option value="">Select Class</option>
            {filteredClasses.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.section}</option>
            ))}
            </select>
        </div>
      </div>

      {/* Student Select */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Student (Optional)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("studentId", { setValueAs: (v) => (v === "" ? undefined : String(v)) })}
        >
          <option value="">Select Student</option>
          {filteredStudents.map((std: any) => (
            <option key={std.id} value={std.id}>{std.name}</option>
          ))}
        </select>
        {errors?.studentId && (
          <p className="text-xs text-red-400">{errors.studentId.message?.toString()}</p>
        )}
      </div>

      {/* Message Body */}
      <div className="flex flex-col w-full">
        <label className="text-sm font-medium text-gray-500">Message Body</label>
        <textarea
          {...register("message")}
          className="min-h-[150px] p-3 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter detailed message..."
        />
        {errors?.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {state.error && <span className="text-red-500 text-sm">Something went wrong!</span>}

      <button className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition">
        {type === "create" ? "Send Notification" : "Update Notification"}
      </button>
    </form>
  );
};

export default MessageForm;