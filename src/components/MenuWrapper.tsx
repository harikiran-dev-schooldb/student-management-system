"use client";

import { useUser } from "@clerk/nextjs";
import Menu from "./Menu";

export default function MenuWrapper() {
  const { user } = useUser();

  const role =
    (user?.publicMetadata?.role as "admin" | "teacher" | "student") ??
    "student";

  return <Menu role={role} />;
}
