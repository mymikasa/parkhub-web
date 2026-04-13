import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { billingService } from "@/lib/api/billing";

const mockRules = [
  {
    id: "bill_001",
    parkingLotId: "lot_001",
    parkingLotName: "万科翡翠滨江地下停车场",
    freeDurationMinutes: 15,
    unitPrice: 8,
    dailyCap: 64,
    billingCycle: "hourly",
    enabled: true,
    updatedAt: "2026-03-01T10:00:00Z",
  },
];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("billingService", () => {
  it("list calls GET /api/billing-rules", async () => {
    server.use(
      http.get("/api/billing-rules", () => {
        return HttpResponse.json({ data: mockRules });
      })
    );

    const result = await billingService.list();
    expect(result).toHaveLength(1);
    expect(result[0].parkingLotId).toBe("lot_001");
  });

  it("list with parkingLotId passes filter", async () => {
    server.use(
      http.get("/api/billing-rules", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("parkingLotId")).toBe("lot_001");
        return HttpResponse.json({ data: mockRules });
      })
    );

    const result = await billingService.list({ parkingLotId: "lot_001" });
    expect(result).toHaveLength(1);
  });

  it("update calls PUT /api/billing-rules/:id", async () => {
    server.use(
      http.put("/api/billing-rules/bill_001", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ unitPrice: 10 });
        return HttpResponse.json({ data: { ...mockRules[0], unitPrice: 10 } });
      })
    );

    const result = await billingService.update("bill_001", { unitPrice: 10 });
    expect(result.unitPrice).toBe(10);
  });

  it("calculate calls POST /api/billing-rules/calculate", async () => {
    server.use(
      http.post("/api/billing-rules/calculate", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          parkingLotId: "lot_001",
          entryTime: "2026-03-13T09:30:00.000Z",
          exitTime: "2026-03-13T14:30:00.000Z",
        });
        return HttpResponse.json({
          data: {
            duration: "5小时0分钟",
            freeDuration: "15分钟",
            billableDuration: "4小时45分钟 → 5小时",
            unitPrice: 8,
            totalFee: 40,
          },
        });
      })
    );

    const result = await billingService.calculate({
      parkingLotId: "lot_001",
      entryTime: "2026-03-13T09:30:00.000Z",
      exitTime: "2026-03-13T14:30:00.000Z",
    });
    expect(result.totalFee).toBe(40);
    expect(result.duration).toBe("5小时0分钟");
  });
});
