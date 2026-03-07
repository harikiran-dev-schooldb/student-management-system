"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSchoolSlug } from "../hooks/getschool";
import { useTenantApi } from "@/hooks/useTenantApi";

const SubjectForm = ({
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: data?.name || "",
      gradeId: data?.gradeId || [], // Default value as an empty array
      id: data?.id || undefined,
    },
  });

  const api = useTenantApi();

  const onSubmit = async (formData: SubjectSchema) => {
    try {

      const dataToSend =
        type === "create"
          ? { name: formData.name, gradeId: formData.gradeId }
          : formData;

      if (type === "create") {
        await api.post("/subjects", dataToSend);
      } else {
        await api.put(`/subjects/${formData.id}`, dataToSend);
      }

      toast.success(
        `Subject ${type === "create" ? "created" : "updated"} successfully!`,
      );

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    }
  };

  const { grades, teachers } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap justify-between gap-4 p-4">
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        {type === "update" && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Multi-select Grades */}
        <div className="flex flex-col w-full gap-2 md:w-1/3">
          <label className="text-xs text-gray-500">Grades</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId || []}
          >
            {grades?.map((grade: { id: string; level: string }) => (
              <option key={grade.id} value={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors?.gradeId && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>
      </div>

      <button className="p-2 text-white bg-blue-400 rounded-md" type="submit">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
