"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { homeworkSchema, HomeworkSchema } from "@/lib/formValidationSchemas";
import { useTenantApi } from "@/hooks/useTenantApi";

const HomeworkForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<HomeworkSchema> & { id?: number };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    grades: any[];
    classes: any[];
    teacherClassIds?: number[];
    role?: string;
  };
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(
    data?.gradeId || null,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HomeworkSchema>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      description: data?.description || "",
      gradeId: data?.gradeId ?? undefined,
      classId: data?.classId ?? undefined,
      date: new Date().toISOString(), // date is not shown, just passed internally
    },
  });

  const gradeId = watch("gradeId");

  useEffect(() => {
    if (gradeId) setSelectedGrade(Number(gradeId));
  }, [gradeId]);

  const api = useTenantApi();

  const onSubmit = async (formData: HomeworkSchema) => {
    setLoading(true);

    try {
      const today = new Date().toISOString();

      const payload = {
        description: formData.description,
        gradeId: formData.gradeId,
        classId: formData.classId,
        date: today,
      };

      const isGrouped = data?.groupId;
      const targetId = isGrouped ? data?.id : data?.id;

      if (type === "create") {
        await api.post("/homeworks", payload);
      } else {
        await api.put(`/homeworks/${targetId}`, payload);
      }

      toast.success(
        `Homework ${type === "create" ? "created" : "updated"} successfully!`,
      );

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };


  const { classes = [], grades = [], teacherClassIds = [], role } = relatedData || {};

  const filteredClasses = selectedGrade
    ? classes.filter((cls: { id: number; gradeId: number }) => {
      if (role === "teacher") {
        return (
          cls.gradeId === selectedGrade &&
          teacherClassIds.includes(cls.id)
        );
      }

      return cls.gradeId === selectedGrade;
    })
    : [];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Homework" : "Update Homework"}
      </h1>

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-sm font-medium text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          >
            <option value="">Select Grade</option>
            {grades.map((grd: { id: number; level: string }) => (
              <option key={grd.id} value={grd.id}>
                {grd.level}
              </option>
            ))}
          </select>
          {errors?.gradeId && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}

          <label className="text-sm font-medium text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          >
            <option value="">Select Section</option>
            {filteredClasses.map((cls: { id: number; section: string }) => (
              <option key={cls.id} value={cls.id}>
                {cls.section}
              </option>
            ))}
          </select>
          {errors?.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}

          <label className="text-sm font-medium text-gray-500">
            Description
          </label>
          <textarea
            {...register("description")}
            className="min-w-[700px] h-64 p-3 text-sm border border-gray-300 rounded-md"
            placeholder="Enter homework details..."
          ></textarea>
          {errors?.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default HomeworkForm;
