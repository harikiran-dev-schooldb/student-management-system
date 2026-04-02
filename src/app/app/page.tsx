"use client";

import { useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

export default function AppEntry() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  function navigate(path: string) {
    // ✅ Always safe for Capacitor
    window.location.href = path;
  }

  async function init() {
    try {
      const [{ value: schoolId }, { value: token }, { value: role }] =
        await Promise.all([
          Preferences.get({ key: "schoolId" }),
          Preferences.get({ key: "token" }),
          Preferences.get({ key: "role" }),
        ]);

      // 🔐 Logged in → dashboard
      if (schoolId && token && role) {
        navigate(`/${schoolId}/${role}`);
        return;
      }

      // 🏫 School selected → login
      if (schoolId) {
        navigate(`/${schoolId}/login`);
        return;
      }

      // 🆕 New user → select school
      navigate("/select-school");

    } catch (error) {
      console.error("App init error:", error);
      navigate("/select-school");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  );
}