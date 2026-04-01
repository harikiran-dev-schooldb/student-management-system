"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppEntry() {
    const router = useRouter();

    useEffect(() => {
        const schoolId = localStorage.getItem("schoolId");
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // AppEntry
        if (schoolId && token && role) {
            router.replace(`/${schoolId}/${role}`);
        } else if (schoolId) {
            router.replace(`/${schoolId}/login`);
        } else {
            router.replace("/select-school");
        }

        // ❌ New user → select school
        router.replace("/select-school");
    }, [router]);

    return null; // no UI = instant redirect
}