export async function tenantFetch<T = any>(
  schoolId: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!schoolId) {
    throw new Error("Missing schoolId for tenant request");
  }

  const response = await fetch(
    `/api/v1/tenants/${schoolId}${path}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed (${response.status})`;

    const error = new Error(message);
    (error as any).errors = json?.errors;

    throw error;
  }

  // ✅ KEY FIX HERE
  return (json?.data ?? json) as T;
}