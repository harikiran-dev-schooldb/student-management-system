"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useSchoolSlug } from "./hooks/getschool";

type Role = { id: string; role: string };
type Props = { roles: Role[]; activeRoleId?: string };

export default function SwitchMenu({ roles, activeRoleId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useClerk();
  const schoolId = useSchoolSlug();
  console.log("Current School:", schoolId);

  // ✅ Ensure unique roles by `role`
  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    return roles.filter((r) => {
      if (seen.has(r.role)) return false;
      seen.add(r.role);
      return true;
    });
  }, [roles]);

  async function switchRole(roleId: string) {
    if (!roleId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/tenants/${schoolId}/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });

      if (!res.ok) {
        console.error("Failed to switch role", await res.json());
        return;
      }

      // Refresh Clerk session
      await session?.reload();

      // Refresh UI + middleware checks
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      disabled={loading}
      onChange={(e) => switchRole(e.target.value)}
      value={activeRoleId || ""}
      className="p-2 rounded border"
    >
      <option value="">Switch Role</option>
      {uniqueRoles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.role}
        </option>
      ))}
    </select>
  );
}
