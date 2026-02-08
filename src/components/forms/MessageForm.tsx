"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getMessageContent } from "@/lib/utils/messageUtils";

const useApiRequest = () => {
  const makeRequest = async (url: string, method: string, body: any) => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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
    reset,
    setValue,
    watch,
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
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

  const router = useRouter();
  const { makeRequest } = useApiRequest();

  const { classes = [], grades = [], students = [] } = relatedData || {};

  // Debugging: Check the data being passed
  console.log("Classes:", classes);
  console.log("Students:", students);
  console.log("Grades:", grades);

  console.log("Related Data:", relatedData);


  // Filter classes based on selected gradeId
  const filteredClasses = selectedGradeId
    ? classes.filter((cls: any) => cls.gradeId === Number(selectedGradeId))
    : classes;

  // Final filtered students: only from selected class
  const filteredStudents = selectedClassId
    ? students.filter((std: any) => std.classId === Number(selectedClassId))
    : [];

  // Debugging: Check the filtered results
  console.log("Filtered Classes:", filteredClasses);
  console.log("Filtered Students by Grade:", filteredStudents);

  useEffect(() => {
    setValue("studentId", "");
  }, [selectedGradeId, setValue]);

  useEffect(() => {
    if (state.success) {
      toast.success(`Message ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  useEffect(() => {
    const generatedMessage = getMessageContent(watch("type"), {
      name: studentName,
      className: Class,
    });
    

    setValue("message", generatedMessage);
  }, [studentName, Class, watch("type"), setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    if (type === "update" && !data?.id) {
      toast.error("Missing message ID for update.");
      return;
    }

    try {
      const payload = {
        message: formData.message,
        type: formData.type,
        studentId: formData.studentId || null,
        date: formData.date,
        classId: formData.classId || null,
        gradeId: formData.gradeId || null,
      };

      console.log("Created Message:", payload)

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
        {type === "create" ? "Create Message" : "Update Message"}
      </h1>

      <InputField label="Date" name="date" type="date" register={register} error={errors?.date} />

      {/* Grade Select */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Grade</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("gradeId", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
        >
          <option value="">Select Grade</option>
          {grades.map((gr: { id: number; level: string }) => (
            <option key={gr.id} value={gr.id}>
              {gr.level}
            </option>
          ))}
        </select>
        {errors?.gradeId && (
          <p className="text-xs text-red-400">{errors.gradeId.message?.toString()}</p>
        )}
      </div>

      {/* Class Select - Filtered by Grade */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Class</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("classId", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
        >
          <option value="">Select Class</option>
          {filteredClasses.map((cls: { id: number; section: string }) => (
            <option key={cls.id} value={cls.id}>
              {cls.section}
            </option>
          ))}
        </select>
        {errors?.classId && (
          <p className="text-xs text-red-400">{errors.classId.message?.toString()}</p>
        )}
      </div>

      {/* Student Select - Filtered by Grade */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Student</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("studentId", {
            setValueAs: (v) => (v === "" ? undefined : String(v)), // Convert to string
          })}
        >
          <option value="">Select Student</option>
          {filteredStudents.map((std: { id: number; name: string }) => (
            <option key={std.id} value={std.id}>{std.name}</option>
          ))}
        </select>

        {errors?.studentId && (
          <p className="text-xs text-red-400">{errors.studentId.message?.toString()}</p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col w-full">
        <label className="text-sm font-medium text-gray-500">Message</label>
        <textarea
          {...register("message")}
          defaultValue={data?.description}
          className="min-w-[700px] h-64 p-3 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter homework details..."
        />
        {errors?.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Type</label>
        <select
          {...register("type")}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        >
          <option value="">Select Type</option>
          <option value="FEE_RELATED">FEE RELATED</option>
          <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          <option value="GENERAL">GENERAL</option>
        </select>
        {errors?.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
      </div>

      {state.error && <span className="text-red-500 text-sm">Something went wrong!</span>}

      <button className="p-2 text-white bg-blue-500 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MessageForm;