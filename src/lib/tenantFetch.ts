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

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;

    try {
      const errorData = await response.json();
      errorMessage = errorData?.error || errorMessage;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
