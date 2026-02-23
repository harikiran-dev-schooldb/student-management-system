"use client";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { studentschema, Studentschema } from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { tenantFetch } from "@/lib/tenantFetch";

const StudentForm = ({
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
    reset,
    formState: { errors },
  } = useForm<Studentschema>({
    resolver: zodResolver(studentschema),
    defaultValues: data || {},
  });

  const { grades, classes } = relatedData;
  const [img, setImg] = useState<any>();
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(
    data?.gradeId || null
  );
  const [filteredClasses, setFilteredClasses] = useState(
    data?.gradeId
      ? classes.filter((cls: any) => cls.gradeId === data.gradeId)
      : []
  );

  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
  }>({
    success: false,
    error: null,
  });

  const router = useRouter();
  const { schoolId } = useParams<{ schoolId: string }>();
  

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  useEffect(() => {
    if (selectedGradeId !== null) {
      const related = classes.filter(
        (cls: any) => cls.gradeId === selectedGradeId
      );
      setFilteredClasses(related);
    } else {
      setFilteredClasses([]);
    }
  }, [selectedGradeId, classes]);

  const onSubmit = handleSubmit((data) => {
    console.log("Form Data Captured:", data);
    startTransition(() => {
      formAction(data);
    });
  });

  const formAction = async (data: any) => {
  const payload = { ...data, img: img?.secure_url };

  try {
    await tenantFetch(
      schoolId,
      type === "update"
        ? `/users/students/${data.id}`
        : `/users/students`,
      {
        method: type === "update" ? "PUT" : "POST",
        body: JSON.stringify(payload),
      }
    );

    setState({ success: true, error: null });
  } catch (error: any) {
    setState({ success: false, error: String(error) });
  }
};

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <form className="flex flex-col gap-8 pb-24 md:pb-8" onSubmit={onSubmit}>
      

      {/* Personal Info */}
      <span className="text-xs font-medium text-gray-400">
        Personal Information
      </span>
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Admission No"
          name="id"
          defaultValue={data?.id}
          register={register}
          placeholder="Enter Admission No"
          error={errors.id}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Student Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
          placeholder="As per Record"
        />
        <InputField
          label="Father Name"
          name="fatherName"
          defaultValue={data?.fatherName}
          register={register}
          error={errors.fatherName}
          placeholder="Enter Father Name"
        />
        <InputField
          label="Mother Name"
          name="motherName"
          defaultValue={data?.motherName}
          register={register}
          error={errors.motherName}
          placeholder="Enter Mother Name"
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
          placeholder="Enter Mobile Number"
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
          placeholder="Enter Address"
        />
        <InputField
          label="Email (Optional)"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
          placeholder="Enter email id"
        />
        <InputField
          label="Birthday"
          name="dob"
          defaultValue={
            data?.dob ? new Date(data.dob).toISOString().split("T")[0] : ""
          }
          register={register}
          error={errors.dob}
          type="date"
        />

        {/* Gender */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="gender" className="text-xs text-gray-500">
            Gender
          </label>
          <select
            id="gender"
            {...register("gender")}
            defaultValue={data?.gender || ""}
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender?.message && (
            <p className="text-xs text-red-400">
              {errors.gender.message.toString()}
            </p>
          )}
        </div>

        {/* Academic Year */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="academicYear" className="text-xs text-gray-500">
            Academic Year
          </label>
          <select
            id="academicYear"
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"            {...register("academicYear")}
            defaultValue={data?.academicYear ?? ""}
          >
            <option value="" disabled>
              Select academic year
            </option>
            <option value="Y2024_2025">2024-25</option>
            <option value="Y2025_2026">2025-26</option>
          </select>
          {errors.academicYear?.message && (
            <p className="text-xs text-red-400">
              {errors.academicYear.message.toString()}
            </p>
          )}
        </div>

        {/* Grade Select */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="gradeId" className="text-xs text-gray-500">
            Grade
          </label>
          <select
            id="gradeId"
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"            {...register("gradeId")}
            defaultValue={data?.gradeId ?? ""}
            onChange={(e) => setSelectedGradeId(parseInt(e.target.value))}
          >
            <option value="" disabled>
              Select grade
            </option>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-500">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        {/* Class Select */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="classId" className="text-xs text-gray-500">
            Class
          </label>
          <select
            id="classId"
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"            {...register("classId")}
            defaultValue={data?.classId ?? ""}
            disabled={filteredClasses.length === 0}
          >
            <option value="" disabled>
              Select class
            </option>
            {filteredClasses.map((cls: { id: number; section: string }) => (
              <option value={cls.id} key={cls.id}>
                {cls.section}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-500">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <InputField
          label="Pen Number"
          name="penNo"
          defaultValue={data?.penNo}
          register={register}
          error={errors.penNo}
          placeholder="Enter Pen Number"
        />
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Photo (Optional)
          </label>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              console.log("Image Uploaded:", result.info);
              widget.close();
            }}
          >
            {({ open }) => (
              <div
                className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="Upload" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            )}
          </CldUploadWidget>
        </div>

        <InputField
          label="Father Aadhar"
          name="fatherAadhar"
          defaultValue={data?.fatherAadhar}
          register={register}
          error={errors.fatherAadhar}
          placeholder="Enter Father Aadhar"
        />
        <InputField
          label="Student Aadhar"
          name="studentAadhar"
          defaultValue={data?.studentAadhar}
          register={register}
          error={errors.studentAadhar}
          placeholder="Enter Student Aadhar"
        />
        <InputField
          label="Mother Aadhar"
          name="motherAadhar"
          defaultValue={data?.motherAadhar}
          register={register}
          error={errors.motherAadhar}
          placeholder="Enter Mother Aadhar"
        />
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

export default StudentForm;
