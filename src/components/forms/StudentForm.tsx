"use client";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
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
  const form = useForm<Studentschema>({
    resolver: zodResolver(studentschema),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { classes } = relatedData;
  const [img, setImg] = useState<any>();

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
    if (!data) return;

    reset({
      ...data,
      dob: data?.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
      joinedDate: data?.joinedDate
        ? new Date(data.joinedDate).toISOString().split("T")[0]
        : "",
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(
    (data) => {
      console.log("VALID:", data);
      startTransition(() => formAction(data));
    },
    (errors) => {
      console.log("FORM ERRORS:", errors);
    },
  );

  const formAction = async (formData: any) => {
    try {
      const cleanedPayload = Object.fromEntries(
        Object.entries({
          ...formData,
          img: img?.secure_url ?? data?.img ?? null,
        }).filter(([_, v]) => v !== "" && v !== undefined && v !== null),
      );

      await tenantFetch(
        schoolId,
        type === "update" ? `/users/students/${data?.id}` : `/users/students`,
        {
          method: type === "update" ? "PUT" : "POST",
          body: JSON.stringify(cleanedPayload),
        },
      );

      setState({ success: true, error: null });
    } catch (error: any) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]: any) => {
          messages.forEach((msg: string) => toast.error(msg));
        });
      }

      setState({
        success: false,
        error: error.message || "Request failed",
      });
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
      {/* Academic Info */}
      <span className="text-xs font-medium text-gray-400">
        Academic Information
      </span>
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Admission No"
          name="admissionNo"
          register={register}
          placeholder="Enter Admission No"
          error={errors.admissionNo}
          inputProps={{
            disabled: type === "update",
          }}
        />
        <InputField
          label="Joined Date"
          name="joinedDate"
          register={register}
          error={errors.joinedDate}
          type="date"
        />

        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="classId" className="text-xs text-gray-500">
            Class
          </label>
          <select
            id="classId"
            defaultValue={data?.classId}
            {...register("classId", { valueAsNumber: true })}
            className="p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"
          >
            <option value="" disabled>
              Select class
            </option>
            {classes.map((cls: any) => (
              <option value={cls.id} key={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-500">
              {errors.classId.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <span className="text-xs font-medium text-gray-400">
        Personal Information
      </span>
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Student Name"
          name="name"
          register={register}
          error={errors.name}
          placeholder="As per Record"
        />
        <InputField
          label="Father Name"
          name="fatherName"
          register={register}
          error={errors.fatherName}
          placeholder="Enter Father Name"
        />
        <InputField
          label="Father Qualification"
          name="fatherQualification"
          register={register}
          error={errors.fatherQualification}
          placeholder="Enter Father Qualification"
        />
        <InputField
          label="Father Profession"
          name="fatherProfession"
          register={register}
          error={errors.fatherProfession}
          placeholder="Enter Father Profession"
        />
        <InputField
          label="Mother Name"
          name="motherName"
          register={register}
          error={errors.motherName}
          placeholder="Enter Mother Name"
        />
        <InputField
          label="Mother Qualification"
          name="motherQualification"
          register={register}
          error={errors.motherQualification}
          placeholder="Enter Mother Qualification"
        />
        <InputField
          label="Mother Profession"
          name="motherProfession"
          register={register}
          error={errors.motherProfession}
          placeholder="Enter Mother Profession"
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          placeholder="Enter Mobile Number"
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
          placeholder="Enter Address"
        />
        <InputField
          label="Email (Optional)"
          name="email"
          register={register}
          error={errors?.email}
          placeholder="Enter email id"
        />
        <InputField
          label="Birthday"
          name="dob"
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
            defaultValue={data?.gender}
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"
          >
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
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="religion" className="text-xs text-gray-500">
            Religion
          </label>

          <select
            id="religion"
            {...register("religion")}
            defaultValue={data?.religion}
            className="
      p-2 rounded-md text-sm w-full
      bg-gray-100 text-gray-900 border border-gray-300
      dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
    "
          >
            <option value="">Select Religion</option>

            <option value="HINDU">Hindu</option>

            <option value="MUSLIM">Muslim</option>

            <option value="CHRISTIAN">Christian</option>

            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="gender" className="text-xs text-gray-500">
            Blood Group
          </label>
          <select
            id="bloodType"
            {...register("bloodType")}
            defaultValue={data?.bloodType}
            className="
  p-2 rounded-md text-sm w-full
  bg-gray-100 text-gray-900 border border-gray-300
  dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
  focus:ring-2 focus:ring-LamaSky focus:border-transparent
"
          >
            <option value="" disabled>
              Select Blood Group
            </option>
            <option value="A_POS">A+</option>
            <option value="A_NEG">A-</option>
            <option value="B_POS">B+</option>
            <option value="B_NEG">B-</option>
            <option value="AB_POS">AB+</option>
            <option value="AB_NEG">AB-</option>
            <option value="O_POS">O+</option>
            <option value="O_NEG">O-</option>
            <option value="O_NEG">O-</option>
            <option value="O_NEG">O-</option>
            <option value="NA">Not Applicable</option>
          </select>
          {errors.bloodType?.message && (
            <p className="text-xs text-red-400">
              {errors.bloodType.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Pen Number"
          name="penNo"
          register={register}
          error={errors.penNo}
          placeholder="Enter Pen Number"
        />

        {/* Image Upload */}
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
          label="Student Aadhar"
          name="studentAadhar"
          register={register}
          error={errors.studentAadhar}
          placeholder="Enter Student Aadhar"
        />

        <InputField
          label="Father Aadhar"
          name="fatherAadhar"
          register={register}
          error={errors.fatherAadhar}
          placeholder="Enter Father Aadhar"
        />
        <InputField
          label="Mother Aadhar"
          name="motherAadhar"
          register={register}
          error={errors.motherAadhar}
          placeholder="Enter Mother Aadhar"
        />

        <InputField
          label="Nationality"
          name="nationality"
          register={register}
          error={errors.nationality}
          placeholder="Indian"
        />

        <InputField
          label="Mother Tongue"
          name="motherTongue"
          register={register}
          error={errors.motherTongue}
          placeholder="Telugu"
        />

        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label htmlFor="category" className="text-xs text-gray-500">
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            defaultValue={data?.category ?? ""}
            className="
      p-2 rounded-md text-sm w-full
      bg-gray-100 text-gray-900 border border-gray-300
      dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10
    "
          >
            <option value="">Select Category</option>
            <option value="GENERAL">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
          {errors.category?.message && (
            <p className="text-xs text-red-400">
              {errors.category.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col w-full gap-3 md:w-1/4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Facilities
          </span>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              defaultChecked={Boolean(data?.transportRequired)}
              {...register("transportRequired")}
              className="h-4 w-4 rounded border-gray-300"
            />
            Transport Required
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              defaultChecked={Boolean(data?.hostelRequired)}
              {...register("hostelRequired")}
              className="h-4 w-4 rounded border-gray-300"
            />
            Hostel Required
          </label>
        </div>
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
