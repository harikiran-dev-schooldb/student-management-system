import axios, { AxiosInstance } from "axios";

export const createTenantApi = (schoolId: string): AxiosInstance => {
  const api = axios.create({
    baseURL: `/api/v1/tenants/${schoolId}`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // 🔥 Global error normalization
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      return Promise.reject(new Error(message));
    }
  );

  return api;
};