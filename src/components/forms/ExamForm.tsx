"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";
import { Exams } from "../../../types";
import { Subject } from "@prisma/client";
import { useSchoolSlug } from "../hooks/getschool";

const ExamForm = ({
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
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [examsForDate, setExamsForDate] = useState<Exams[]>([]);
  const [existingTitles, setExistingTitles] = useState<
    { id: number; title: string }[]
  >([]);
  const [titleOpen, setTitleOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      ...data,
    },
  });

  const schoolId = useSchoolSlug();

  useEffect(() => {
    if (type === "update" && data) {
      reset({
        id: data?.id,
        title: data?.title || "",
        examDate: data?.examGradeSubjects?.[0]?.date || "",
        startTime: data?.examGradeSubjects?.[0]?.startTime || "",
        gradeId: data?.examGradeSubjects?.[0]?.gradeId || "",
        subjectId: data?.examGradeSubjects?.[0]?.subjectId || "",
        maxMarks: data?.examGradeSubjects?.[0]?.maxMarks || "",
        academicYearId: data?.examGradeSubjects?.[0]?.academicYearId || "",
      });
      setSelectedGradeId(data?.examGradeSubjects?.[0]?.gradeId || null);
    }
  }, [type, data, reset]);

  useEffect(() => {
    const handleClickOutside = () => setTitleOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!schoolId) return;

    const fetchAcademicYear = async () => {
      try {
        const data = await tenantFetch<{
          academicYear: { id: number; name: string };
        }>(schoolId, "/academic-years/active");

        setValue("academicYearId", data.academicYear.id);
      } catch (err) {
        console.error("Failed to fetch academic year", err);
      }
    };

    fetchAcademicYear();
  }, [schoolId, setValue]);

  useEffect(() => {
    if (!selectedGradeId || !schoolId) {
      setFilteredSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const data = await tenantFetch<{
          success: boolean;
          subjects: Subject[];
        }>(schoolId, `/grades/${selectedGradeId}/subjects`, {
          method: "GET",
        });

        setFilteredSubjects(data.subjects ?? []);
      } catch (error) {
        setFilteredSubjects([]);
      }
    };

    fetchSubjects();
  }, [selectedGradeId, schoolId]);

  const selectedDate = watch("examDate");

  useEffect(() => {
    if (!selectedDate || !schoolId) return;

    const fetchExamsForDate = async () => {
      try {
        const query = new URLSearchParams({
          date:
            typeof selectedDate === "string"
              ? selectedDate
              : selectedDate.toISOString().split("T")[0],
        }).toString();

        const data = await tenantFetch<{
          exams: Exams[];
        }>(schoolId, `/exams/by-date?${query}`, { method: "GET" });

        setExamsForDate(data.exams ?? []);
      } catch (err) {
        setExamsForDate([]);
      }
    };

    fetchExamsForDate();
  }, [selectedDate, schoolId]);

  useEffect(() => {
    if (!schoolId) return;

    const fetchTitles = async () => {
      try {
        const data = await tenantFetch<{
          titles: { id: number; title: string }[];
        }>(schoolId, "/exams?titles=true");

        setExistingTitles(data.titles ?? []);
      } catch {
        toast.error("Failed to fetch exam titles.");
        setExistingTitles([]);
      }
    };

    fetchTitles();
  }, [schoolId]);

  const onSubmit = async (formData: ExamSchema) => {
    console.log("Form Data:", formData);
    if (!schoolId) return;

    const activeAcademicYearId = 1;

    try {
      const path = type === "create" ? "/exams" : `/exams/${formData.id}`;

      const method = type === "create" ? "POST" : "PUT";

      await tenantFetch(schoolId, path, {
        method,
        body: JSON.stringify({ ...formData, academicYearId: activeAcademicYearId }),

      });

      toast.success(
        `Exam ${type === "create" ? "created" : "updated"} successfully!`,
      );

      setOpen(false);
      router.refresh();
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit exam.");
    }
  };

  const onDelete = async (examId: number) => {
    if (!schoolId) return;

    try {
      await tenantFetch(schoolId, `/exams/${examId}`, {
        method: "DELETE",
      });

      toast.success("Deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
      console.error("Error during delete:", err);
    }
  };

  const { grades } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-64">
        <input
          type="text"
          value={watch("title") || ""}
          onChange={(e) => {
            setValue("title", e.target.value);
            setTitleOpen(true);
          }}
          onFocus={() => setTitleOpen(true)}
          placeholder="Type or select a title"
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        />

        {titleOpen && existingTitles.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md max-h-48 overflow-y-auto">
            {existingTitles
              .filter((exam) =>
                exam.title
                  .toLowerCase()
                  .includes((watch("title") || "").toLowerCase()),
              )
              .map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => {
                    setValue("title", exam.title);
                    setTitleOpen(false);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {exam.title}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-4">
        {/* Exam Date */}
        <InputField
          label="Exam Date"
          name="examDate"
          register={register}
          error={errors?.examDate}
          type="date"
        />

        {/* Start Time */}
        <InputField
          label="Start Time"
          name="startTime"
          register={register}
          error={errors?.startTime}
          type="time"
        />

        {/* Grade */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedGradeId(value ? parseInt(value) : null);
            }}
          >
            <option value="">Select Grade</option>
            {grades?.map((grade: { id: number; level: string }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="flex flex-col w-full gap-2 md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>

        {/* Max Marks */}
        <InputField
          label="Max Marks"
          name="maxMarks"
          register={register}
          error={errors?.maxMarks}
          type="number"
        />

        {/* Hidden ID field if updating */}
        {data && (
          <InputField
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      {selectedDate && examsForDate.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Exams on{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>

          <ul className="space-y-2 text-sm">
            {examsForDate.map((exam: any) => (
              <li key={exam.id} className="border p-2 rounded-md">
                <div>
                  <strong>{exam.title}</strong> at{" "}
                  {new Date(
                    `1970-01-01T${exam.examGradeSubjects[0]?.startTime}`,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {exam.examGradeSubjects.map((egs: any) => (
                  <div key={egs.id} className="text-xs text-gray-600">
                    Grade: {egs.Grade?.level}, Subject: {egs.Subject?.name},
                    Marks: {egs.maxMarks}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        <button className="p-2 text-white bg-blue-400 rounded-md">
          {type === "create" ? "Create" : "Update"}
        </button>

        {type === "update" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to delete this exam?")) {
                onDelete(data.id)
                  .then(() => {
                    setOpen(false);
                    router.refresh();
                  })
                  .catch((err) => {
                    toast.error(err.message || "Failed to delete exam");
                  });
              }
            }}
            className="p-2 text-white bg-red-500 rounded-md"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
};

export default ExamForm;
