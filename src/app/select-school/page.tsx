"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

type School = {
  id: string;
  schoolId: string;
  name: string;
};

export default function SelectSchool() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [searching, setSearching] = useState(false);

  // 🔎 Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSchools([]);
      return;
    }

    const delay = setTimeout(() => {
      searchSchools(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  async function searchSchools(value: string) {
    try {
      setSearching(true);

      const res = await fetch(
        `/api/v1/public/school/search?q=${encodeURIComponent(value)}`
      );

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data: School[] = await res.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search error:", error);
      setSchools([]);
    } finally {
      setSearching(false);
    }
  }

  async function selectSchool(schoolId: string, schoolName: string) {
    try {
      // ✅ Capacitor storage (persistent + reliable in mobile)
      await Preferences.set({ key: "schoolId", value: schoolId });
      await Preferences.set({ key: "schoolName", value: schoolName });

      router.replace(`/${schoolId}/login`);
    } catch (error) {
      console.error("Storage error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-2xl font-semibold text-center mb-2">
          Select Your School
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Search for your school to continue
        </p>

        <input
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search your school..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="space-y-2 max-h-72 overflow-y-auto">

          {searching && (
            <p className="text-sm text-gray-400 text-center">
              Searching...
            </p>
          )}

          {!searching && query && schools.length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              No schools found
            </p>
          )}

          {schools.map((school) => (
            <div
              key={school.id}
              onClick={() => selectSchool(school.schoolId, school.name)}
              className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <p className="font-medium">{school.name}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}