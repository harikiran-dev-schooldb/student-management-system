"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const ClassForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id, // ✅ include id for updates
      gradeId: data?.gradeId || "",
      section: data?.section || "",
      supervisorId: data?.supervisorId || "",
    },
  });

  const router = useRouter();
  const { teachers = [], grades = [] } = relatedData || {};

  const params = useParams();
  const slug = params.schoolId as string;
  console.log("School ID from params:", slug);

  const onSubmit = async (formData: ClassSchema) => {
    try {
      const url =
        type === "create" ? `/${slug}/api/classes/create` : `/${slug}/api/classes/update`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, id: data?.id }), // include id for update
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("API error response:", result);
        toast.error(result?.error || "Something went wrong.");
        return;
      }

      toast.success(
        `Class ${type === "create" ? "created" : "updated"} successfully!`,
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Client-side error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap justify-between gap-4">
        {/* Grade */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            <option value="" disabled>
              Select Grade
            </option>
            {grades.map((grade: { id: string; level: string }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>

        {/* Section */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="section" className="text-xs text-gray-500">
            Section
          </label>
          <select
            id="section"
            {...register("section")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="" disabled>
              Select Section
            </option>
            {["A", "B", "C", "D", "E"].map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {errors.section?.message && (
            <p className="text-xs text-red-400">{errors.section.message}</p>
          )}
        </div>

        {/* Supervisor */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
          >
            <option value="" disabled>
              Select Teacher
            </option>
            {teachers.map((teacher: { id: string; name: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="p-2 text-white bg-blue-400 rounded-md disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Submitting..."
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;
