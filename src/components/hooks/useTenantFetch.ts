import { useCallback } from "react";
import { useParams } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";

export function useTenantFetch() {
  const { schoolId } = useParams<{ schoolId: string }>();

  const fetcher = useCallback(
    <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
      if (!schoolId) {
        return Promise.reject(
          new Error("Missing schoolId in route params")
        );
      }

      return tenantFetch<T>(schoolId, path, options);
    },
    [schoolId]
  );

  return fetcher;
}
