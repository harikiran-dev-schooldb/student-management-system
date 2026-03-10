"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useTenantApi } from "@/hooks/useTenantApi";

type AssignmentSchema = {
  id?: number;
  title: string;
  description?: string;
  gradeId: number;
  classId: number;
  subjectId: number;
  dueDate: string;
  maxMarks: number;
};

type Subject = {
  id: number;
  name: string;
};

const AssignmentForm = ({
  type,
  data,
  relatedData,
  setOpen,
}: any) => {
  const router = useRouter();
  const api = useTenantApi();

  const { grades = [], classes = [], subjects = [] } = relatedData || {};

  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    defaultValues: data || {},
  });

  const selectedGrade = watch("gradeId");
  const selectedClass = watch("classId");

  /* ---------------- Grade → Filter Classes ---------------- */
  useEffect(() => {
    if (!selectedGrade) {
      setFilteredClasses([]);
      return;
    }

    const filtered = classes.filter(
      (cls: any) => cls.gradeId === Number(selectedGrade)
    );

    setFilteredClasses(filtered);
  }, [selectedGrade, classes]);

  /* ---------------- Class → Filter Subjects ---------------- */
  useEffect(() => {
    if (!selectedClass) {
      setFilteredSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await api.get<{ data: Subject[] }>(`/classes/${selectedClass}/subjects`);
        setFilteredSubjects(res.data);
      } catch {
        setFilteredSubjects([]);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  /* ---------------- Submit ---------------- */

  const onSubmit = async (formData: AssignmentSchema) => {
    try {
      if (type === "create") {
        await api.post("/assignments", formData);
      } else {
        await api.put(`/assignments/${formData.id}`, formData);
      }

      toast.success(
        `Assignment ${type === "create" ? "created" : "updated"
        } successfully`
      );

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* Title */}
      <input
        placeholder="Assignment Title"
        {...register("title")}
        className="input"
      />
      {errors.title && <p className="text-red-400 text-xs">Required</p>}

      {/* Description */}
      <textarea
        placeholder="Description"
        {...register("description")}
        className="input"
      />

      {/* Grade */}
      <select {...register("gradeId", { valueAsNumber: true })}>
        <option value="">Select Grade</option>
        {grades.map((g: any) => (
          <option key={g.id} value={g.id}>
            {g.level}
          </option>
        ))}
      </select>

      {/* Class */}
      <select {...register("classId", { valueAsNumber: true })}>
        <option value="">Select Class</option>
        {filteredClasses.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.section}
          </option>
        ))}
      </select>

      {/* Subject */}
      <select {...register("subjectId", { valueAsNumber: true })}>
        <option value="">Select Subject</option>
        {filteredSubjects.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Due Date */}
      <input type="date" {...register("dueDate")} />

      {/* Max Marks */}
      <input
        type="number"
        placeholder="Max Marks"
        {...register("maxMarks", { valueAsNumber: true })}
      />

      <button className="bg-blue-500 text-white p-2 rounded">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;