import { useMemo } from "react";
import { createTenantApi } from "@/lib/api/tenantAxios";

export const useTenantApi = (schoolId: string) => {
  return useMemo(() => {
    if (!schoolId) throw new Error("schoolId is required");
    return createTenantApi(schoolId);
  }, [schoolId]);
};