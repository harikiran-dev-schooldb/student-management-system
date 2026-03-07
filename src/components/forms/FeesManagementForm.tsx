"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { feesSchema, FeesSchema } from "@/lib/formValidationSchemas";
import InputField from "../InputField";
import { useTenantApi } from "@/hooks/useTenantApi";

const FeesManagementForm = ({
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeesSchema>({
    resolver: zodResolver(feesSchema),
    defaultValues: data || {},
  });

  const { grades = [] } = relatedData || {};
  
  const api = useTenantApi();

  // ✅ Submit handler (uses fetch → API routes)
  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);


      const endpoint =
        type === "create" ? "/fees/create" : `/fees/update?id=${formData.id}`;

      await api.post(endpoint, formData);

      toast.success(
        `Fees has been ${
          type === "create" ? "created" : "updated"
        } successfully!`,
      );

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error submitting form:", err);
      toast.error(
        err?.response?.data?.error || err.message || "Something went wrong!",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8 pb-24 md:pb-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fees" : "Update Fees"}
      </h1>

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          {/* Academic Year */}
          <label className="text-sm font-medium text-gray-500">
            Academic Year
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("academicYear", {
              required: "Academic Year is required",
            })}
            defaultValue={data?.academicYear}
          >
            <option value="">Select Academic Year</option>
            <option value="Y2024_2025">2024-25</option>
            <option value="Y2025_2026">2025-26</option>
          </select>
          {errors.academicYear && (
            <p className="text-xs text-red-400">
              {errors.academicYear.message}
            </p>
          )}

          {/* Grade */}
          <label className="text-sm font-medium text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId", {
              valueAsNumber: true,
              required: "Grade is required",
            })}
          >
            <option value="">Select Grade</option>
            {grades.map((grd: { id: number; level: string }) => (
              <option key={grd.id} value={grd.id}>
                {grd.level}
              </option>
            ))}
          </select>
          {errors.gradeId && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}

          {/* Term */}
          <label className="text-sm font-medium text-gray-500">Term</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("term", { required: "Term is required" })}
            defaultValue={data?.term || ""}
          >
            <option value="">Select Term</option>
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
            <option value="TERM_4">Term 4</option>
          </select>
          {errors.term && (
            <p className="text-xs text-red-400">{errors.term.message}</p>
          )}

          {/* Term Fees */}
          <label className="text-sm font-medium text-gray-500">Term Fees</label>
          <input
            type="number"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("termFees", {
              valueAsNumber: true,
              required: "Term Fees are required",
            })}
            defaultValue={data?.termFees}
          />
          {errors.termFees && (
            <p className="text-xs text-red-400">{errors.termFees.message}</p>
          )}

          {/* Abacus Fees */}
          <InputField
            label="Abacus Fees"
            name="abacusFees"
            defaultValue={data?.abacusFees}
            register={register}
            error={errors?.abacusFees}
          />

          {/* Start Date */}
          <label className="text-sm font-medium text-gray-500">
            Start Date
          </label>
          <input
            type="date"
            {...register("startDate", { required: "Start Date is required" })}
            defaultValue={
              data?.startDate
                ? new Date(data.startDate).toISOString().split("T")[0]
                : ""
            }
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate.message}</p>
          )}

          {/* Due Date */}
          <label className="text-sm font-medium text-gray-500">Due Date</label>
          <input
            type="date"
            {...register("dueDate", { required: "Due Date is required" })}
            defaultValue={
              data?.dueDate
                ? new Date(data.dueDate).toISOString().split("T")[0]
                : ""
            }
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.dueDate && (
            <p className="text-xs text-red-500">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <button
        className="p-2 text-white bg-blue-500 rounded-md disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default FeesManagementForm;
