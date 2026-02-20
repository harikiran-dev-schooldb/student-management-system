import { tenantFetch } from "@/lib/tenantFetch";
import { useParams } from "next/navigation";

export function tFetch() {
  const { schoolId } = useParams<{ schoolId: string }>();

  return (path: string, options?: RequestInit) =>
    tenantFetch(schoolId, path, options);
}
