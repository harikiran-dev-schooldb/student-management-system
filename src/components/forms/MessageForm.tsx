"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { useSchoolSlug } from "../hooks/getschool";

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
  const selectedStudentId = watch("studentId");
  const selectedType = watch("type");
  const [schoolName, setSchoolName] = useState<string>("School");

  const router = useRouter();
  const { makeRequest } = useApiRequest();
  const schoolId = useSchoolSlug();

  const { classes = [], grades = [], students = [] } = relatedData || {};

  // Filter classes based on selected gradeId
  const filteredClasses = selectedGradeId
    ? classes.filter((cls: any) => cls.gradeId === Number(selectedGradeId))
    : classes;

  useEffect(() => {
    setValue("classId", undefined);
    setValue("studentId", undefined);
  }, [selectedGradeId, setValue]);

  // Final filtered students: only from selected class
  const filteredStudents = selectedClassId
    ? students.filter((std: any) => std.classId === Number(selectedClassId))
    : [];

  useEffect(() => {
    setValue("studentId", undefined);
  }, [selectedClassId, setValue]);

  useEffect(() => {
    setValue("studentId", "");
  }, [selectedGradeId, setValue]);

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Message ${type === "create" ? "created" : "updated"} successfully!`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`/api/v1/public/school/${schoolId}`);
        if (!res.ok) return;

        const data = await res.json();
        setSchoolName(data.name);
      } catch (err) {
        console.error("Failed to fetch school", err);
      }
    };

    if (schoolId) fetchSchool();
  }, [schoolId]);

  useEffect(() => {
    if (!selectedType) return;

    const student = students.find(
      (s: any) => String(s.id) === String(selectedStudentId),
    );

    const cls = classes.find(
      (c: any) => Number(c.id) === Number(selectedClassId),
    );

    const generatedMessage = getMessageContent(selectedType, {
      studentName: student?.name || "",
      className: cls?.name || "",
      schoolName,
    });

    setValue("message", generatedMessage);
  }, [
    selectedType,
    selectedStudentId,
    selectedClassId,
    students,
    classes,
    schoolName, // ✅ added
    setValue,
  ]);

  const baseUrl = `/api/v1/tenants/${schoolId}/messages`;

  const onSubmit = handleSubmit(async (formData) => {
    if (type === "update" && !data?.id) {
      toast.error("Missing message ID for update.");
      return;
    }

    try {
      let payload: any = {
        message: formData.message,
        type: formData.type,
        date: formData.date,
      };

      // Priority: student > class > grade
      if (formData.studentId) {
        payload.studentId = formData.studentId;
      } else if (formData.classId) {
        payload.classId = formData.classId;
      } else if (formData.gradeId) {
        payload.gradeId = formData.gradeId;
      }

      console.log("Created Message:", payload);

      const url = type === "create" ? baseUrl : `${baseUrl}/${data?.id}`;
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
      <InputField
        label="Date"
        name="date"
        type="date"
        register={register}
        error={errors?.date}
      />

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
          <p className="text-xs text-red-400">
            {errors.gradeId.message?.toString()}
          </p>
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
          <p className="text-xs text-red-400">
            {errors.classId.message?.toString()}
          </p>
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
          {filteredStudents.map((std: { id: string; name: string }) => (
            <option key={std.id} value={std.id}>
              {std.name}
            </option>
          ))}
        </select>

        {errors?.studentId && (
          <p className="text-xs text-red-400">
            {errors.studentId.message?.toString()}
          </p>
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
        {errors?.type && (
          <p className="text-xs text-red-400">{errors.type.message}</p>
        )}
      </div>

      {state.error && (
        <span className="text-red-500 text-sm">Something went wrong!</span>
      )}

      <button className="p-2 text-white bg-blue-500 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MessageForm;
