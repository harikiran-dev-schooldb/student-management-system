"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { dropdownUI } from "../../types";
import { tenantFetch } from "@/lib/tenantFetch";
import { toast } from "react-toastify";

export default function TitleFilterDropdown({
  basePath,
}: {
  basePath: string;
}) {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { schoolId } = useParams<{ schoolId: string }>();

  useEffect(() => {
    if (!schoolId) return;

    const fetchTitles = async () => {
      try {
        const data = await tenantFetch<{
          titles: { id: number; title: string }[];
        }>(schoolId, "/exams?titles=true");

        setTitles((data.titles ?? []).map((t) => t.title));
      } catch {
        toast.error("Failed to fetch exam titles.");
        setTitles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [schoolId]);

  const handleChange = (title: string) => {
    const params = new URLSearchParams(searchParams);
    if (title) {
      params.set("title", title);
    } else {
      params.delete("title");
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const selectedTitle = searchParams.get("title") || "";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative w-full md:w-auto">
        <select
          className={dropdownUI}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          value={selectedTitle}
        >
          <option value="">Select Exam</option>
          {titles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
