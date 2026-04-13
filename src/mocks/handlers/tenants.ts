import { http, HttpResponse, delay } from "msw";
import { mockTenants, getTenantSummary, getParkingLotsByTenantId, tenantParkingLotMap } from "../data/tenants";
import type { Tenant } from "@/types";

export const tenantHandlers = [
  http.get("/api/tenants/summary", async () => {
    await delay(200);
    return HttpResponse.json({ data: getTenantSummary() });
  }),

  http.get("/api/tenants", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword");
    const status = url.searchParams.get("status");

    let filtered = [...mockTenants];

    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.companyName.toLowerCase().includes(kw) ||
          t.contactPerson.toLowerCase().includes(kw) ||
          (t.description && t.description.toLowerCase().includes(kw))
      );
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: { data, total, page, pageSize },
    });
  }),

  http.post("/api/tenants", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as Record<string, unknown>;
    const newTenant: Tenant = {
      id: `tnt_${String(mockTenants.length + 1).padStart(3, "0")}`,
      companyName: String(body.companyName ?? ""),
      description: body.description ? String(body.description) : undefined,
      creditCode: body.creditCode ? String(body.creditCode) : undefined,
      contactPerson: String(body.contactPerson ?? ""),
      contactPhone: String(body.contactPhone ?? ""),
      adminEmail: body.adminEmail ? String(body.adminEmail) : undefined,
      remark: body.remark ? String(body.remark) : undefined,
      parkingLotCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTenants.push(newTenant);
    return HttpResponse.json({ data: newTenant });
  }),

  http.patch("/api/tenants/:id", async ({ params, request }) => {
    await delay(300);
    const id = params.id as string;
    const tenant = mockTenants.find((t) => t.id === id);

    if (!tenant) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "租户不存在" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const allowedFields = [
      "companyName", "description", "creditCode",
      "contactPerson", "contactPhone", "adminEmail", "remark",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (tenant as unknown as Record<string, unknown>)[field] = body[field];
      }
    }
    tenant.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: tenant });
  }),

  http.post("/api/tenants/:id/freeze", async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const tenant = mockTenants.find((t) => t.id === id);

    if (!tenant) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "租户不存在" },
        { status: 404 }
      );
    }

    if (tenant.status === "frozen") {
      return HttpResponse.json(
        { code: "ALREADY_FROZEN", message: "租户已是冻结状态" },
        { status: 400 }
      );
    }

    tenant.status = "frozen";
    tenant.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: tenant });
  }),

  http.post("/api/tenants/:id/unfreeze", async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const tenant = mockTenants.find((t) => t.id === id);

    if (!tenant) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "租户不存在" },
        { status: 404 }
      );
    }

    if (tenant.status === "active") {
      return HttpResponse.json(
        { code: "ALREADY_ACTIVE", message: "租户已是正常状态" },
        { status: 400 }
      );
    }

    tenant.status = "active";
    tenant.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: tenant });
  }),

  http.get("/api/tenants/:id/parking-lots", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const tenant = mockTenants.find((t) => t.id === id);

    if (!tenant) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "租户不存在" },
        { status: 404 }
      );
    }

    const lots = getParkingLotsByTenantId(id);
    return HttpResponse.json({ data: lots });
  }),
];
