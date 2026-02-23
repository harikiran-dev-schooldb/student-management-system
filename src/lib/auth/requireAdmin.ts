import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

export async function requireAdmin(slug: string) {
  try {
    const access = await requireTenantAccess();

    // 🔐 Ensure URL tenant matches active tenant
    if (access.schoolSlug !== slug) {
      redirect("/unauthorized");
    }

    // 🔐 Ensure role is admin
    if (access.role !== "admin") {
      redirect("/unauthorized");
    }

    return access; // contains schoolId (internal PK) + profileId
  } catch {
    redirect("/unauthorized");
  }
}