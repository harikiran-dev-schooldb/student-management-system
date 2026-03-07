"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { dropdownUI } from "../../../types";
import { useTenantApi } from "@/hooks/useTenantApi";

type AcademicYear = {
  id: string;
  name: string;
};

export default function AcademicYearDropdown({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useTenantApi();

  const selectedYear = searchParams.get("academicYear") || "";

  const [years, setYears] = useState<AcademicYear[]>([]);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await api.get<AcademicYear[]>("/academic-years");
        setYears(res.data);
      } catch (err) {
        console.error("Failed to load academic years", err);
      }
    };

    loadYears();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (year) params.set("academicYear", year);
    else params.delete("academicYear");

    params.delete("page");

    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="relative w-full md:w-auto">
      <select
        className={`${dropdownUI} dark:bg-gray-800 dark:text-white`}
        onChange={handleChange}
        value={selectedYear}
      >
        <option value="">Select Academic Year</option>

        {years.map((y) => (
          <option key={y.id} value={y.id}>
            {y.name}
          </option>
        ))}

      </select>
    </div>
  );
}