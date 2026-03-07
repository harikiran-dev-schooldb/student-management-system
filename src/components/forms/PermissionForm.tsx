"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { SlipSchema, slipSchema } from "@/lib/formValidationSchemas";
import { useTenantApi } from "@/hooks/useTenantApi";

interface PermissionResponse {
  gateSlipPdf?: string;
}

const PermissionForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<SlipSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    grades: any[];
    classes: any[];
    students: any[];
  };
}) => {
  const router = useRouter();

  const [selectedGrade, setSelectedGrade] = useState<number | null>(
    data?.gradeId ?? null,
  );
  const [selectedClass, setSelectedClass] = useState<number | null>(
    data?.classId ?? null,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SlipSchema>({
    resolver: zodResolver(slipSchema),
    defaultValues: {
      studentId: data?.studentId || "",
      leaveType: data?.leaveType || undefined,
      subReason: data?.subReason || "",
      description: data?.description || "",
      date: data?.date || new Date().toISOString().split("T")[0],
      gradeId: data?.gradeId,
      classId: data?.classId,
      withWhom: data?.withWhom || "",
      relation: data?.relation || "",
    },
  });

  const leaveType = watch("leaveType");

  // Update selectedGrade when gradeId changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "gradeId") {
        const gradeValue = Number(value.gradeId);
        setSelectedGrade(gradeValue || null);
        // Reset class and student when grade changes
        setSelectedClass(null);
        setValue("classId", undefined);
        setValue("studentId", "");
      }

      if (name === "classId") {
        const classValue = Number(value.classId);
        setSelectedClass(classValue || null);
        // Reset student when class changes
        setValue("studentId", "");
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const { classes = [], grades = [], students = [] } = relatedData || {};

  const filteredClasses = selectedGrade
    ? classes.filter((cls) => cls.gradeId === selectedGrade)
    : [];

  const filteredStudents = selectedClass
    ? students.filter((stu) => stu.classId === selectedClass)
    : [];

  const api = useTenantApi();
  const onSubmit = async (formData: SlipSchema) => {
    try {
      if (!api) return;

      const { data } = await api.post<PermissionResponse>("/permissions", formData);

      toast.success("Permission slip created successfully!");
      setOpen(false);
      router.refresh();

      // ✅ Download PDF if available
      if (data?.gateSlipPdf) {
        const link = document.createElement("a");
        link.href = data.gateSlipPdf;
        link.download = `GateSlip-${formData.studentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error("Client error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Issue Permission Slip" : "Update Permission Slip"}
      </h1>

      <div className="flex flex-wrap justify-between gap-4">
        {/* Grade */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("gradeId", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          >
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-500">{errors.gradeId.message}</p>
          )}
        </div>

        {/* Class */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("classId", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          >
            <option value="">Select Class</option>
            {filteredClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.section}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-500">{errors.classId.message}</p>
          )}
        </div>

        {/* Student */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("studentId")}
          >
            <option value="">Select Student</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-500">{errors.studentId.message}</p>
          )}
        </div>

        {/* Leave Type */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Leave Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("leaveType", {
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
          >
            <option value="">Select Leave Type</option>
            <option value="SICK">SICK</option>
            <option value="PERSONAL">PERSONAL</option>
            <option value="HALFDAY">HALFDAY</option>
            <option value="DAILY_PERMISSION">DAILY PERMISSION</option>
          </select>
          {errors.leaveType?.message && (
            <p className="text-xs text-red-500">{errors.leaveType.message}</p>
          )}
        </div>

        {/* Sub Reason */}
        {leaveType === "SICK" && (
          <div className="flex flex-col w-full gap-2 md:w-1/3">
            <label className="text-xs text-gray-500">
              Sub Reason (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Fever, Headache"
              {...register("subReason")}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            />
          </div>
        )}
      </div>

      {/* Extra Fields */}
      <div className="flex flex-wrap justify-between gap-4">
        {/* With Whom */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">With Whom</label>
          <input
            type="text"
            {...register("withWhom")}
            placeholder="e.g., Name of the person"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
        </div>

        {/* Relation */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Relation</label>
          <input
            type="text"
            {...register("relation")}
            placeholder="e.g., Parent, Guardian"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col w-full gap-2 md:w-1/2">
          <label className="text-xs text-gray-500">
            Description (optional)
          </label>
          <textarea
            {...register("description")}
            placeholder="Write reason or details..."
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting
          ? "Submitting..."
          : type === "create"
            ? "Submit Slip"
            : "Update Slip"}
      </button>
    </form>
  );
};

export default PermissionForm;
