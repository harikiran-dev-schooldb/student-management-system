import axios from "axios";

export const createTenantApi = (schoolId: string) => {
  const api = axios.create({
    baseURL: `/api/v1/tenants/${schoolId}`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      return Promise.reject(new Error(message));
    }
  );

  return {
    get: async <T>(url: string, config?: any): Promise<T> =>
      api.get(url, config),

    post: async <T>(url: string, data?: any, config?: any): Promise<T> =>
      api.post(url, data, config),

    put: async <T>(url: string, data?: any, config?: any): Promise<T> =>
      api.put(url, data, config),

    delete: async <T>(url: string, config?: any): Promise<T> =>
      api.delete(url, config),
  };
};