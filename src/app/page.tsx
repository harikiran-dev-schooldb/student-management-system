"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  useEffect(() => {

    const schoolId = localStorage.getItem("schoolId");

    if (schoolId) {
      router.replace(`/${schoolId}/login`);
    } else {
      router.replace("/select-school");
    }

  }, []);

  return null;
}