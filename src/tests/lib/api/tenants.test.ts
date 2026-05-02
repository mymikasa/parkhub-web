import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { tenantService } from "@/lib/api/tenants";

const mockBackendTenant = {
  tenant_id: "tnt_001",
  name: "万科物业管理有限公司",
  contact_name: "张明辉",
  contact_phone: "13888881234",
  contact_email: "admin@vanke.com",
  status: "TENANT_STATUS_ACTIVE",
  address: "",
  plan_type: "PLAN_TYPE_BASIC",
  description: "万科企业股份有限公司旗下",
  credit_code: "91310000607233001X",
  remark: "",
  parking_lot_count: 24,
  created_at: "2025-08-15T08:00:00Z",
  updated_at: "2026-03-10T14:30:00Z",
};

const mockSummary = {
  total: 20,
  active: 17,
  frozen: 3,
  totalParkingLots: 326,
  avgParkingLotsPerTenant: 16.3,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("tenantService", () => {
  it("getSummary calls GET /api/v1/tenants/summary", async () => {
    server.use(
      http.get("/api/v1/tenants/summary", () => HttpResponse.json(mockSummary))
    );
    const result = await tenantService.getSummary();
    expect(result.total).toBe(20);
    expect(result.active).toBe(17);
  });

  it("list calls GET /api/v1/tenants with nested pagination params", async () => {
    server.use(
      http.get("/api/v1/tenants", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("pagination.page")).toBe("1");
        expect(url.searchParams.get("pagination.page_size")).toBe("10");
        return HttpResponse.json({
          tenants: [mockBackendTenant],
          pagination: { page: 1, page_size: 10, total: 20, total_pages: 2 },
        });
      })
    );
    const result = await tenantService.list({ page: 1, pageSize: 10 });
    expect(result.total).toBe(20);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("tnt_001");
    expect(result.data[0].companyName).toBe("万科物业管理有限公司");
    expect(result.data[0].contactPerson).toBe("张明辉");
    expect(result.data[0].adminEmail).toBe("admin@vanke.com");
    expect(result.data[0].status).toBe("active");
    expect(result.data[0].parkingLotCount).toBe(24);
  });

  it("list translates status filter to backend enum", async () => {
    server.use(
      http.get("/api/v1/tenants", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("TENANT_STATUS_FROZEN");
        return HttpResponse.json({
          tenants: [],
          pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
        });
      })
    );
    const result = await tenantService.list({ status: "frozen" });
    expect(result.total).toBe(0);
  });

  it("create calls POST /api/v1/tenants with mapped body", async () => {
    server.use(
      http.post("/api/v1/tenants", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.name).toBe("新公司");
        expect(body.contact_name).toBe("张三");
        expect(body.contact_phone).toBe("13800001111");
        return HttpResponse.json({
          tenant: { ...mockBackendTenant, tenant_id: "tnt_new", name: "新公司" },
        });
      })
    );
    const result = await tenantService.create({
      companyName: "新公司",
      contactPerson: "张三",
      contactPhone: "13800001111",
    });
    expect(result.companyName).toBe("新公司");
    expect(result.id).toBe("tnt_new");
  });

  it("update calls PUT /api/v1/tenants/:id with mapped body", async () => {
    server.use(
      http.put("/api/v1/tenants/tnt_001", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.name).toBe("新名称");
        return HttpResponse.json({
          tenant: { ...mockBackendTenant, name: "新名称" },
        });
      })
    );
    const result = await tenantService.update("tnt_001", { companyName: "新名称" });
    expect(result.companyName).toBe("新名称");
  });

  it("freeze calls POST /api/v1/tenants/:id/freeze", async () => {
    server.use(
      http.post("/api/v1/tenants/tnt_001/freeze", () =>
        HttpResponse.json({
          tenant: { ...mockBackendTenant, status: "TENANT_STATUS_FROZEN" },
        })
      )
    );
    const result = await tenantService.freeze("tnt_001");
    expect(result.status).toBe("frozen");
  });

  it("unfreeze calls POST /api/v1/tenants/:id/unfreeze", async () => {
    server.use(
      http.post("/api/v1/tenants/tnt_001/unfreeze", () =>
        HttpResponse.json({
          tenant: { ...mockBackendTenant, status: "TENANT_STATUS_ACTIVE" },
        })
      )
    );
    const result = await tenantService.unfreeze("tnt_001");
    expect(result.status).toBe("active");
  });

  it("getParkingLots calls GET /api/v1/tenants/:id/parking-lots", async () => {
    const mockLots = [{ id: "lot_001", name: "车场1" }];
    server.use(
      http.get("/api/v1/tenants/tnt_001/parking-lots", () =>
        HttpResponse.json({ parkingLots: mockLots })
      )
    );
    const result = await tenantService.getParkingLots("tnt_001");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("lot_001");
  });

  it("maps proto Timestamp created_at to ISO string", async () => {
    server.use(
      http.get("/api/v1/tenants/tnt_001", () =>
        HttpResponse.json({
          tenant: {
            ...mockBackendTenant,
            created_at: { seconds: 1700000000, nanos: 0 },
            updated_at: { seconds: 1700000000, nanos: 500000000 },
          },
        })
      )
    );
    const result = await tenantService.get("tnt_001");
    expect(result.createdAt).toBe(new Date(1700000000 * 1000).toISOString());
    expect(result.updatedAt).toBe(new Date(1700000000 * 1000 + 500).toISOString());
  });
});
