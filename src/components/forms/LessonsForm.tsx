"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonsSchema, LessonsSchema } from "@/lib/formValidationSchemas";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSchoolSlug } from "../hooks/getschool";
import { useTenantApi } from "@/hooks/useTenantApi";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const { classes = [], teachers = [], grades = [] } = relatedData || {};

  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(
    data?.gradeId || null,
  );
  const [filteredClasses, setFilteredClasses] = useState(
    data?.gradeId
      ? classes.filter((cls: any) => cls.gradeId === data.gradeId)
      : [],
  );

  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
  }>({
    success: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LessonsSchema>({
    resolver: zodResolver(lessonsSchema),
    defaultValues: {
      ...data,
    },
  });

  const classIdWatch = watch("classId");
  const api = useTenantApi();

  useEffect(() => {
    if (!classIdWatch || !api) return;

    const fetchSubjects = async () => {
      try {
        const { data } = await api.get(`/classes/${classIdWatch}/subjects`);

        setSubjects(Array.isArray(data) ? data : []);
        setValue("subjectId", 0);
      } catch (error: any) {
        setSubjects([]);
        toast.error(error.message || "Failed to fetch subjects");
      }
    };

    fetchSubjects();
  }, [classIdWatch, api, setValue]);

  // Update filteredClasses when grade changes
  useEffect(() => {
    if (selectedGradeId !== null) {
      const related = classes.filter(
        (cls: any) => cls.gradeId === selectedGradeId,
      );
      setFilteredClasses(related);
    } else {
      setFilteredClasses([]);
    }
  }, [selectedGradeId, classes]);

  // For edit case, reset form with existing data
  useEffect(() => {
    if (type === "update" && data) {
      reset({
        ...data,
        period: data.period || undefined,
      });
    }
  }, [data, reset, type]);

  const onSubmit = async (formData: LessonsSchema) => {
    try {
      if (!classIdWatch || !api) return;

      if (type === "create") {
        await api.post("/lessons", formData);
      } else {
        await api.put(`/lessons/${formData?.id}`, formData);
      }

      toast.success(
        `Lesson ${type === "create" ? "created" : "updated"} successfully!`,
      );

      setOpen(false);
      router.refresh();
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit lesson.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        {/* Day */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("day")}
          >
            <option value="">Select Day</option>
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((day) => (
              <option value={day} key={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">{errors.day.message}</p>
          )}
        </div>

        {/* Period */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Period</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("period")}
          >
            <option value="">Select Period</option>
            {[
              "PERIOD1",
              "PERIOD2",
              "PERIOD3",
              "PERIOD4",
              "PERIOD5",
              "PERIOD6",
              "PERIOD7",
              "PERIOD8",
            ].map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
          {errors.period?.message && (
            <p className="text-xs text-red-400">{errors.period.message}</p>
          )}
        </div>

        {/* Grade */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("gradeId", { valueAsNumber: true })}
            defaultValue={data?.gradeId ?? ""}
            onChange={(e) => setSelectedGradeId(parseInt(e.target.value))}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option key={grade.id} value={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>

        {/* Class (filtered by Grade) */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId ?? ""}
            disabled={filteredClasses.length === 0}
          >
            <option value="">Select Class</option>
            {filteredClasses.map((cls: { id: number; section: string }) => (
              <option key={cls.id} value={cls.id}>
                {cls.section}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        {/* Subject (depends on Class) */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("subjectId", { valueAsNumber: true })}
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>

        {/* Teacher */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register("teacherId")}
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher: { id: string; name: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>
      </div>

      <button className="self-start px-4 py-2 text-white bg-blue-500 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LessonForm;
