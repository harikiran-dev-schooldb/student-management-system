"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SelectSchool() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [schools, setSchools] = useState<any[]>([]);

    // ✅ 1. Check cache on load
    useEffect(() => {
        const schoolId = localStorage.getItem("schoolId");

        if (schoolId) {
            router.replace(`/${schoolId}/login`);
        }
    }, []);

    async function searchSchools(value: string) {
        setQuery(value);

        if (!value) {
            setSchools([]);
            return;
        }

        const res = await fetch(`/api/v1/public/school/search?q=${value}`);
        const data = await res.json();
        setSchools(data);
    }

    function selectSchool(schoolId: string, schoolName: string) {
        localStorage.setItem("schoolId", schoolId);
        localStorage.setItem("schoolName", schoolName);

        // ✅ Use replace (better UX)
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
                    onChange={(e) => searchSchools(e.target.value)}
                />

                <div className="space-y-2">
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