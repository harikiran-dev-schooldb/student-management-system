"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppEntry() {
    const router = useRouter();

    useEffect(() => {
        const schoolId = localStorage.getItem("schoolId");
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // ✅ Logged in → dashboard
        if (schoolId && token && role) {
            router.replace(`/${schoolId}/${role}`);
            return;
        }

        // ✅ School selected → login
        if (schoolId) {
            router.replace(`/${schoolId}`);
            return;
        }

        // ❌ New user → select school
        router.replace("/select-school");
    }, [router]);

    return null; // no UI = instant redirect
}