import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("tenants MSW handlers", () => {
  it("GET /api/tenants returns paginated tenants", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants?page=1&pageSize=5");
    const json = await res.json();
    expect(json.data.data.length).toBeLessThanOrEqual(5);
    expect(json.data.total).toBeGreaterThan(0);
    expect(json.data.page).toBe(1);
  });

  it("GET /api/tenants filters by status", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants?status=frozen");
    const json = await res.json();
    json.data.data.forEach((t: { status: string }) => {
      expect(t.status).toBe("frozen");
    });
  });

  it("GET /api/tenants filters by keyword", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants?keyword=万科");
    const json = await res.json();
    json.data.data.forEach((t: { companyName: string }) => {
      expect(t.companyName).toContain("万科");
    });
  });

  it("GET /api/tenants/summary returns counts", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants/summary");
    const json = await res.json();
    expect(json.data.total).toBeGreaterThan(0);
    expect(json.data.active).toBeGreaterThan(0);
    expect(json.data.frozen).toBeGreaterThan(0);
    expect(json.data.total).toBe(json.data.active + json.data.frozen);
  });

  it("POST /api/tenants creates new tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "测试公司",
        contactPerson: "张三",
        contactPhone: "13800001111",
      }),
    });
    const json = await res.json();
    expect(json.data.companyName).toBe("测试公司");
    expect(json.data.status).toBe("active");
  });

  it("PATCH /api/tenants/:id updates tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants/tnt_001", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: "新名称" }),
    });
    const json = await res.json();
    expect(json.data.companyName).toBe("新名称");
  });

  it("POST /api/tenants/:id/freeze freezes tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants/tnt_001/freeze", { method: "POST" });
    const json = await res.json();
    expect(json.data.status).toBe("frozen");
  });

  it("POST /api/tenants/:id/unfreeze unfreezes tenant", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants/tnt_003/unfreeze", { method: "POST" });
    const json = await res.json();
    expect(json.data.status).toBe("active");
  });

  it("GET /api/tenants/:id/parking-lots returns lots", async () => {
    const { tenantHandlers } = await import("@/mocks/handlers/tenants");
    server.use(...tenantHandlers);

    const res = await fetch("/api/tenants/tnt_001/parking-lots");
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });
});
