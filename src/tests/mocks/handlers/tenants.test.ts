import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 租户 CRUD 已接入真实后端（/api/v1/tenants/*），MSW 只兜底 summary 与 parking-lots
// （后端 issue #20 未实现）。下面测试仅验证保留的两个 handler。
describe("tenants MSW handlers (fallback only)", () => {
  it("GET /api/v1/tenants/summary returns counts", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/v1/tenants/summary");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("active");
    expect(json).toHaveProperty("frozen");
    expect(json).toHaveProperty("totalParkingLots");
    expect(json).toHaveProperty("avgParkingLotsPerTenant");
  });

  it("GET /api/v1/tenants/:id/parking-lots returns lots for existing tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/v1/tenants/tnt_001/parking-lots");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.parkingLots)).toBe(true);
  });

  it("GET /api/v1/tenants/:id/parking-lots returns 404 for unknown tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/v1/tenants/tnt_does_not_exist/parking-lots");
    expect(res.status).toBe(404);
  });
});
