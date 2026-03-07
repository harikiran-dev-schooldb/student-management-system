import request from "supertest";

const base = "http://localhost:3000";

describe("Health API", () => {
  it("should return status 200", async () => {
    const res = await request(base).get("/api/v1/public/health");

    expect(res.statusCode).toBe(200);
  });
});