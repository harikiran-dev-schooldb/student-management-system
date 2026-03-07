import request from "supertest";

const base = "http://localhost:3000";
const SCHOOL = "test";

describe("Classes API", () => {
  it("should return classes", async () => {
    const res = await request(base)
      .get(`/api/v1/tenants/${SCHOOL}/classes`);

    expect(res.statusCode).not.toBe(500);
  });
});