"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useSchoolSlug } from "./hooks/getschool";

type Role = { id: number; role: string };
type Props = { roles: Role[]; activeRoleId?: number | null };

export default function RoleSwitcher({ roles, activeRoleId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useClerk();
  const schoolId = useSchoolSlug();

  // ✅ Remove duplicate role names
  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    return roles.filter((r) => {
      if (seen.has(r.role)) return false;
      seen.add(r.role);
      return true;
    });
  }, [roles]);

  async function switchRole(roleId: number) {
    if (!roleId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/tenants/${schoolId}/switch-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });

      if (!res.ok) {
        console.error("Failed to switch role", await res.json());
        return;
      }

      // Refresh Clerk session to pick up new metadata
      await session?.reload();

      // Trigger middleware refresh
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      disabled={loading}
      value={activeRoleId ?? ""} // ✅ handles null
      onChange={(e) => switchRole(Number(e.target.value))}
      className="p-2 rounded-md border text-xs cursor-pointer"
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
