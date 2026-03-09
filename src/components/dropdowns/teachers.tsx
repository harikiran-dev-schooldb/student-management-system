"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { dropdownUI } from "../../../types";
import { useSchoolSlug } from "../hooks/getschool";

export default function TeacherFilterDropdown({
  teachers,
}: {
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = useSchoolSlug();

  const selectedTeacherId = searchParams.get("teacherId") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (teacherId) {
      params.set("teacherId", teacherId);
      params.delete("classId"); // remove class filter if switching to teacher
    } else {
      params.delete("teacherId");
    }

    router.push(`/${slug}/list/lessons?${params.toString()}`);
  };


  return (
  <div className="flex flex-col gap-4 md:flex-row md:items-center">
    {/* Teacher Dropdown */}
    <div className="relative w-full md:w-auto">
      <select
        className={dropdownUI}
        onChange={handleChange}
        value={selectedTeacherId}
      >
        <option value="" disabled>
          Select Teacher
        </option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);
}
