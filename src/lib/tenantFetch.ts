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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    const error = new Error(message);

    // attach API errors (optional but powerful)
    (error as any).errors = data?.errors;

    throw error;
  }

  return data as T;
}