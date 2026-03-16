import { NextResponse } from "next/server";
import { requireTenantAccess } from "@/lib/requireTenantAccess";

export async function tenantGuard() {
  const access = await requireTenantAccess();

  if (!access) {
  return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { access };
}

export async function tenantSlugGuard(slug: string) {
  const { access, error } = await tenantGuard();

  if (error) return { error };

  if (access.schoolSlug !== slug) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { access };
}