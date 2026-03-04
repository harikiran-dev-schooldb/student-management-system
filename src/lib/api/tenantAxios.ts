import axios, { AxiosInstance } from "axios";

export const createTenantApi = (schoolId: string) => {
  const api = axios.create({
    baseURL: `/api/v1/tenants/${schoolId}`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => response.data, // 🔥 return only data
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
    get: <T>(url: string, config?: any) => api.get<T>(url, config),
    post: <T>(url: string, data?: any, config?: any) =>
      api.post<T>(url, data, config),
    put: <T>(url: string, data?: any, config?: any) =>
      api.put<T>(url, data, config),
    delete: <T>(url: string, config?: any) =>
      api.delete<T>(url, config),
  };
};