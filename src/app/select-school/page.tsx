"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SelectSchool() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [schools, setSchools] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // 🔎 Debounced search
    useEffect(() => {
        const delay = setTimeout(() => {
            if (query) {
                searchSchools(query);
            } else {
                setSchools([]);
            }
        }, 400); // debounce

        return () => clearTimeout(delay);
    }, [query]);

    async function searchSchools(value: string) {
        try {
            setSearching(true);

            const res = await fetch(
                `/api/v1/public/school/search?q=${encodeURIComponent(value)}`
            );

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            setSchools(data || []);
        } catch (err) {
            console.error("Search error:", err);
            setSchools([]);
        } finally {
            setSearching(false);
        }
    }

    function selectSchool(schoolId: string, schoolName: string) {
        localStorage.setItem("schoolId", schoolId);
        localStorage.setItem("schoolName", schoolName);

        router.replace(`/${schoolId}/login`);
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

                    {!searching && schools.length === 0 && query && (
                        <p className="text-sm text-gray-400 text-center">
                            No schools found
                        </p>
                    )}

                    {schools.map((school) => (
                        <div
                            key={school.id}
                            onClick={() =>
                                selectSchool(school.schoolId, school.name)
                            }
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