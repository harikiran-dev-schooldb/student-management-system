import { createTenantApi } from "@/lib/api/tenantAxios";

export const useTenantApi = (schoolId: string) => {
  return createTenantApi(schoolId);
};