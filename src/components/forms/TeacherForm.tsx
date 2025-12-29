"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherschema, Teacherschema } from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
    formState: { errors },
  } = useForm<Teacherschema>({
    resolver: zodResolver(teacherschema),
  });

  const [img, setImg] = useState<any>();
  const [state, setState] = useState<{ success: boolean; error: boolean }>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const formAction = async (formData: any) => {
    try {
      const currentState = { success: false, error: false }; // Define an initial state

      const apiUrl =
        type === "create"
          ? "/api/users/teachers"
          : `/api/users/teachers/${data?.id}`;
      const response = await fetch(apiUrl, {
        method: type === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, img: img?.secure_url }),
      });

      const responseData = await response.json();
      if (response.ok) {
        currentState.success = true;
      } else {
        currentState.error = true;
      }

      setState({ success: currentState.success, error: currentState.error });
    } catch (err) {
      console.error("Error in form submission:", err);
      setState({ success: false, error: true });
    }
  };

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting data:", data);
    formAction(data);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success]);

  const { subjects } = relatedData || { subjects: [] };

  return (
    <form className="flex flex-col gap-8 pb-24 md:pb-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>

      <span className="text-xs font-medium text-gray-400">
        Authentication Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs font-medium text-gray-400">
        Personal Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Parent Name"
          name="parentName"
          defaultValue={data?.parentName}
          register={register}
          error={errors?.parentName}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        />

        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Blood Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("bloodType")}
            defaultValue={data?.bloodType}
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Under Investigation">Under Investigation</option>
          </select>
          {errors?.bloodType?.message && (
            <p className="text-xs text-red-400">{errors.bloodType.message}</p>
          )}
        </div>

        <InputField
          label="Birthday"
          name="dob"
          defaultValue={data?.dob?.toISOString()?.split("T")[0]}
          register={register}
          error={errors?.dob}
          type="date"
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      <div className="flex flex-wrap gap-16">
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Gender</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
            defaultValue={data?.gender}
          >
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
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"
              onClick={() => open()}
            >
              <img src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {state?.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="p-2 text-white bg-blue-400 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
