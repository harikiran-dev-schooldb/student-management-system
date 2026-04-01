"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

export default function AppEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const [{ value: schoolId }, { value: token }, { value: role }] =
        await Promise.all([
          Preferences.get({ key: "schoolId" }),
          Preferences.get({ key: "token" }),
          Preferences.get({ key: "role" }),
        ]);

      // ✅ Logged in → dashboard
      if (schoolId && token && role) {
        router.replace(`/${schoolId}/${role}`);
        return;
      }

      // ✅ School selected → login
      if (schoolId) {
        router.replace(`/${schoolId}/login`);
        return;
      }

      // ❌ New user → select school
      router.replace("/select-school");

    } catch (error) {
      console.error("App init error:", error);
      router.replace("/select-school");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Loading UI (important for mobile)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-500 text-sm">
        Loading...
      </p>
    </div>
  );
}