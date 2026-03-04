import { useMemo } from "react";
import { createTenantApi } from "@/lib/api/tenantAxios";
import { useSchoolSlug } from "@/components/hooks/getschool";

export const useTenantApi = () => {
  const schoolId = useSchoolSlug();

  return useMemo(() => {
    if (!schoolId) throw new Error("schoolId is required");
    return createTenantApi(schoolId);
  }, [schoolId]);
};