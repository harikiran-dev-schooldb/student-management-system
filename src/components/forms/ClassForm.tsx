"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSchoolSlug } from "../hooks/getschool";
import { useTenantApi } from "@/hooks/useTenantApi";

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

  const schoolId = useSchoolSlug();
  const api = useTenantApi();

  const onSubmit = async (formData: ClassSchema) => {
    if (!schoolId) return;

    try {
      if (type === "create") {
        // 🔹 CREATE
        await api.post("/classes", formData);
        toast.success("Class created successfully!");
      } else {
        // 🔹 UPDATE
        await api.put(`/classes/${data?.id}`, formData);
        toast.success("Class updated successfully!");
      }

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("API error:", error);
      toast.error(
        error?.response?.data?.error ||
          error.message ||
          "Something went wrong.",
      );
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
