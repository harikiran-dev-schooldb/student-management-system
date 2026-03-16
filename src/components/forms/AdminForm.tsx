"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { AdminSchema, adminSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { useSchoolSlug } from "../hooks/getschool";

// Custom hook for API calls
const useApiRequest = () => {
  const makeRequest = async (url: string, method: string, body: any) => {
    try {
      const res = await fetch(url, {
        method,
        credentials: "include", // 🔥 IMPORTANT
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = res.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        throw new Error("Non-JSON response: " + text.slice(0, 100));
      }

      const data = await res.json();

      return data;
    } catch (error: any) {
      throw new Error(error.message || "API request failed");
    }
  };

  return { makeRequest };
};

const AdminForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const [img, setImg] = useState<string | null>(data?.img || null);
  const [state, setState] = useState<{ success: boolean; error: boolean }>({
    success: false,
    error: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSchema>({
    resolver: zodResolver(adminSchema),
    defaultValues: data || {}, // Populate form with existing data
  });

  const router = useRouter();
  const { makeRequest } = useApiRequest(); // Using custom API request hook

  const schoolId = useSchoolSlug();

  useEffect(() => {
    if (state.success) {
      toast(`Admin has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router]);

  const baseUrl = `/api/v1/tenants/${schoolId}/users/admins`;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare the data payload
      const payload = {
        username: data.username,
        name: data.name,
        parentName: data.parentName ?? null,
        gender: data.gender,
        email: data.email ?? null,
        address: data.address,
        bloodType: data.bloodType ?? null,
        dob: data.dob ?? null,
        img: img ?? null,
        phone: data.phone,
      };

      // URL for the API

      const url = type === "create" ? baseUrl : `${baseUrl}/${data?.id}`;

      // Make the API request
      const method = type === "create" ? "POST" : "PUT";
      const result = await makeRequest(url, method, payload);

      // Handle the result
      setState({ success: result.success, error: !result.success });
    } catch (error: any) {
      setState({ success: false, error: true });
      console.error("Error during API request:", error); // Log the error details
      toast.error(`Something went wrong: ${error.message}`); // Show the error message
    }
  });

  const handleDelete = async () => {
    if (!data?.id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin?",
    );
    if (!confirmDelete) return;

    try {
      const result = await makeRequest(`${baseUrl}/${data.id}`, "DELETE", {});

      setState({ success: result.success, error: !result.success });
      toast("Admin deleted successfully!");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <span className="text-xs font-medium text-gray-400">
        Authentication Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors?.email}
        />
      </div>

      <span className="text-xs font-medium text-gray-400">
        Personal Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Full Name"
          name="name"
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Parent Name"
          name="parentName"
          register={register}
          error={errors?.parentName}
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors?.address}
        />

        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Blood Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("bloodType")}
          >
            <option value="" disabled>
              Select Blood Type
            </option>
            {[
              { label: "A+", value: "A_POS" },
              { label: "A-", value: "A_NEG" },
              { label: "B+", value: "B_POS" },
              { label: "B-", value: "B_NEG" },
              { label: "AB+", value: "AB_POS" },
              { label: "AB-", value: "AB_NEG" },
              { label: "O+", value: "O_POS" },
              { label: "O-", value: "O_NEG" },
            ].map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors?.bloodType?.message && (
            <p className="text-xs text-red-400">{errors.bloodType.message}</p>
          )}
        </div>

        <InputField
          label="Birthday"
          name="dob"
          type="date"
          register={register}
          error={errors?.dob}
        />
      </div>

      <div className="flex flex-wrap gap-16">
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Gender</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors?.gender?.message && (
            <p className="text-xs text-red-400">{errors.gender.message}</p>
          )}
        </div>

        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            if (
              result.info &&
              typeof result.info !== "string" &&
              "secure_url" in result.info
            ) {
              setImg(result.info.secure_url);
            } else {
              console.error(
                "Upload failed or returned unexpected data format.",
              );
            }
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"
              onClick={() => open()}
            >
              <img src="/upload.png" alt="Upload" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="p-2 text-white bg-blue-400 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AdminForm;
