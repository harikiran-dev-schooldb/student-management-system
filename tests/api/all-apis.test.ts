import request from "supertest";

const base = "http://localhost:3000";
const SCHOOL = "test";

const endpoints = [
  "/api/v1/public/health",
  `/api/v1/tenants/${SCHOOL}/students`,
  `/api/v1/tenants/${SCHOOL}/classes`,
  `/api/v1/tenants/${SCHOOL}/subjects`,
  `/api/v1/tenants/${SCHOOL}/teachers`,
  `/api/v1/tenants/${SCHOOL}/attendance`,
  `/api/v1/tenants/${SCHOOL}/fees`,
  `/api/v1/tenants/${SCHOOL}/exams`,
];

describe("API Smoke Tests", () => {
  endpoints.forEach((endpoint) => {
    it(`should respond for ${endpoint}`, async () => {
      const res = await request(base).get(endpoint);

      expect(res.statusCode).not.toBe(500);
    });
  });
});