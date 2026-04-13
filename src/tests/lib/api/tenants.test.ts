import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { tenantService } from "@/lib/api/tenants";

const mockSummary = {
  total: 20,
  active: 17,
  frozen: 3,
  totalParkingLots: 326,
  avgParkingLotsPerTenant: 16.3,
};

const mockTenant = {
  id: "tnt_001",
  companyName: "万科物业管理有限公司",
  description: "万科企业股份有限公司旗下",
  creditCode: "91310000607233001X",
  contactPerson: "张明辉",
  contactPhone: "13888881234",
  adminEmail: "admin@vanke.com",
  parkingLotCount: 24,
  status: "active" as const,
  createdAt: "2025-08-15T08:00:00Z",
  updatedAt: "2026-03-10T14:30:00Z",
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("tenantService", () => {
  it("getSummary calls GET /api/tenants/summary", async () => {
    server.use(
      http.get("/api/tenants/summary", () => {
        return HttpResponse.json({ data: mockSummary });
      })
    );

    const result = await tenantService.getSummary();
    expect(result.total).toBe(20);
    expect(result.active).toBe(17);
    expect(result.frozen).toBe(3);
  });

  it("list calls GET /api/tenants with params", async () => {
    server.use(
      http.get("/api/tenants", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("pageSize")).toBe("10");
        return HttpResponse.json({
          data: { data: [mockTenant], total: 20, page: 1, pageSize: 10 },
        });
      })
    );

    const result = await tenantService.list({ page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(20);
  });

  it("list with status filter", async () => {
    server.use(
      http.get("/api/tenants", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("frozen");
        return HttpResponse.json({
          data: { data: [], total: 3, page: 1, pageSize: 10 },
        });
      })
    );

    const result = await tenantService.list({ status: "frozen" });
    expect(result.total).toBe(3);
  });

  it("create calls POST /api/tenants", async () => {
    server.use(
      http.post("/api/tenants", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          companyName: "新公司",
          contactPerson: "张三",
          contactPhone: "13800001111",
        });
        return HttpResponse.json({ data: { ...mockTenant, id: "tnt_new", companyName: "新公司" } });
      })
    );

    const result = await tenantService.create({
      companyName: "新公司",
      contactPerson: "张三",
      contactPhone: "13800001111",
    });
    expect(result.companyName).toBe("新公司");
  });

  it("update calls PATCH /api/tenants/:id", async () => {
    server.use(
      http.patch("/api/tenants/tnt_001", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ companyName: "新名称" });
        return HttpResponse.json({ data: { ...mockTenant, companyName: "新名称" } });
      })
    );

    const result = await tenantService.update("tnt_001", { companyName: "新名称" });
    expect(result.companyName).toBe("新名称");
  });

  it("freeze calls POST /api/tenants/:id/freeze", async () => {
    server.use(
      http.post("/api/tenants/tnt_001/freeze", () => {
        return HttpResponse.json({ data: { ...mockTenant, status: "frozen" } });
      })
    );

    const result = await tenantService.freeze("tnt_001");
    expect(result.status).toBe("frozen");
  });

  it("unfreeze calls POST /api/tenants/:id/unfreeze", async () => {
    server.use(
      http.post("/api/tenants/tnt_001/unfreeze", () => {
        return HttpResponse.json({ data: { ...mockTenant, status: "active" } });
      })
    );

    const result = await tenantService.unfreeze("tnt_001");
    expect(result.status).toBe("active");
  });

  it("getParkingLots calls GET /api/tenants/:id/parking-lots", async () => {
    const mockLots = [{ id: "lot_001", name: "车场1" }];
    server.use(
      http.get("/api/tenants/tnt_001/parking-lots", () => {
        return HttpResponse.json({ data: mockLots });
      })
    );

    const result = await tenantService.getParkingLots("tnt_001");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("lot_001");
  });
});
