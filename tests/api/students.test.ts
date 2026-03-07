import request from "supertest";

const base = "http://localhost:3000";
const SCHOOL = "test";

describe("Students API", () => {
  it("should return students list", async () => {
    const res = await request(base)
      .get(`/api/v1/tenants/${SCHOOL}/students`);

    expect(res.statusCode).not.toBe(500);
  });
});