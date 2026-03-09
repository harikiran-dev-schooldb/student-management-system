"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";

type FormData = {
  schoolName: string;
  slug: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;

  adminUsername: string;
  adminPassword: string;
  adminName: string;
  adminParentName: string;
  adminPhone: string;
  adminAddress: string;
  adminEmail?: string;
  adminGender?: string;
};

export default function CreateSchoolForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const res = await fetch("/api/schools/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create school");
      }

      toast.success("School created successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-6">
        Create New School
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* School Information */}
        <h2 className="font-semibold text-gray-600">
          School Information
        </h2>

        <input
          {...register("schoolName", { required: true })}
          placeholder="School Name"
          className="input"
        />

        <input
          {...register("slug", { required: true })}
          placeholder="School Slug (example: dps-delhi)"
          className="input"
        />

        <input
          {...register("address", { required: true })}
          placeholder="School Address"
          className="input"
        />

        <input
          {...register("phone")}
          placeholder="School Phone"
          className="input"
        />

        <input
          {...register("email")}
          placeholder="School Email"
          className="input"
        />

        <input
          {...register("website")}
          placeholder="School Website"
          className="input"
        />

        {/* Admin Information */}
        <h2 className="font-semibold text-gray-600 mt-6">
          Admin Account
        </h2>

        <input
          {...register("adminUsername", { required: true })}
          placeholder="Admin Username"
          className="input"
        />

        <input
          type="password"
          {...register("adminPassword", { required: true })}
          placeholder="Admin Password"
          className="input"
        />

        <input
          {...register("adminName", { required: true })}
          placeholder="Admin Name"
          className="input"
        />

        <input
          {...register("adminParentName", { required: true })}
          placeholder="Parent Name"
          className="input"
        />

        <input
          {...register("adminPhone", { required: true })}
          placeholder="Admin Phone"
          className="input"
        />

        <input
          {...register("adminAddress", { required: true })}
          placeholder="Admin Address"
          className="input"
        />

        <input
          {...register("adminEmail")}
          placeholder="Admin Email"
          className="input"
        />

        <select {...register("adminGender")} className="input">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Creating..." : "Create School"}
        </button>
      </form>
    </div>
  );
}