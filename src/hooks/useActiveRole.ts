import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "student" | "teacher" | "admin"; // extend if needed

export function useActiveRole() {
  const [role, setRole] = useState<Role | null>(null);
  const {schoolId} = useParams<{ schoolId: string }>();

  useEffect(() => {
    async function fetchRole() {
      const res = await fetch(`/api/v1/tenants/${schoolId}/profile`);
      const data = await res.json();
      const activeRole = data.roles.find((r: any) => r.id === data.activeRoleId);
      if (activeRole) setRole(activeRole.role as Role);
    }
    fetchRole();
  }, []);

  return role;
}
