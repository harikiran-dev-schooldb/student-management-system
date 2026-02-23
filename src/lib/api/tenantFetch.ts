export async function tenantFetch<T = unknown>(
  schoolId: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(
    `/api/v1/tenants/${schoolId}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    }
  );

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json() as Promise<T>;
}