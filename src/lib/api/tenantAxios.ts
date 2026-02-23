import axios, { AxiosInstance } from "axios";

export const createTenantApi = (schoolId: string): AxiosInstance => {
  return axios.create({
    baseURL: `/api/v1/tenants/${schoolId}`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // if using cookies
  });
};