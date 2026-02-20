"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Custom hook for API calls
const useApiRequest = () => {
  const makeRequest = async (url: string, method: string, body: any) => {
    try {
      const res = await fetch(url, {
        method,
        credentials: "include", // 🔥 REQUIRED for Clerk
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "API request failed");
    }
  };

  return { makeRequest };
};

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data || {}, // Pre-fill for update
  });

  const router = useRouter();

  const { makeRequest } = useApiRequest();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Announcement ${
          type === "create" ? "created" : "updated"
        } successfully!`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        classId: formData.classId ?? null,
      };

      const url =
        type === "create"
          ? `/api/v1/tenants/current/announcements`
          : `/api/v1/tenants/current/announcements/${data?.id}`;

      const method = type === "create" ? "POST" : "PUT";

      const result = await makeRequest(url, method, payload);

      setState({ success: result.success, error: !result.success });
    } catch (error: any) {
      console.error("Error submitting announcement:", error);
      setState({ success: false, error: true });
      toast.error(`Error: ${error.message}`);
    }
  });

  const { classes = [] } = relatedData || {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </h1>

      <InputField
        label="Date"
        name="date"
        type="date"
        register={register}
        error={errors?.date}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-500">Class</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("classId", { valueAsNumber: true })}
        >
          <option value="">Select Class</option>
          {classes.map((cls: { id: number; name: string }) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        {errors?.classId && (
          <p className="text-xs text-red-400">{errors.classId.message}</p>
        )}
      </div>

      <InputField
        label="Title"
        name="title"
        register={register}
        error={errors?.title}
      />

      <div className="flex flex-col w-full">
        <label className="text-sm font-medium text-gray-500">Description</label>
        <textarea
          {...register("description")}
          defaultValue={data?.description}
          className="min-w-[700px] h-64 p-3 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter Announcement details..."
        />
        {errors?.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
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

export default AnnouncementForm;
