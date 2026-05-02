import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { parkingLotService } from "@/lib/api/parking-lots";

const mockStatsResponse = {
  total_spaces: 3450,
  available_spaces: 880,
  occupied_vehicles: 2201,
  total_gates: 29,
};

const mockBackendLot = {
  id: "lot_001",
  tenant_id: "tenant_001",
  name: "万科翡翠滨江地下停车场",
  address: "上海市浦东新区陆家嘴环路1000号",
  total_spaces: 800,
  available_spaces: 156,
  lot_type: "LOT_TYPE_UNDERGROUND",
  status: "PARKING_LOT_STATUS_ACTIVE",
  created_at: { seconds: "1705305600", nanos: 0 },
  updated_at: { seconds: "1734703800", nanos: 0 },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("parkingLotService", () => {
  it("getSummary calls GET /parking/v1/lots/stats", async () => {
    server.use(
      http.get("/parking/v1/lots/stats", () => {
        return HttpResponse.json(mockStatsResponse);
      })
    );

    const result = await parkingLotService.getSummary();
    expect(result.totalSpots).toBe(3450);
    expect(result.availableSpots).toBe(880);
    expect(result.occupiedSpots).toBe(2201);
    expect(result.laneCount).toBe(29);
  });

  it("list calls GET /parking/v1/lots with params", async () => {
    server.use(
      http.get("/parking/v1/lots", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("page_size")).toBe("10");
        return HttpResponse.json({
          parking_lots: [mockBackendLot],
          pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
        });
      })
    );

    const result = await parkingLotService.list({ page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("list maps backend fields to frontend format", async () => {
    server.use(
      http.get("/parking/v1/lots", () => {
        return HttpResponse.json({
          parking_lots: [mockBackendLot],
          pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
        });
      })
    );

    const result = await parkingLotService.list();
    const lot = result.data[0];
    expect(lot.type).toBe("underground");
    expect(lot.status).toBe("operating");
    expect(lot.totalSpots).toBe(800);
    expect(lot.availableSpots).toBe(156);
    expect(lot.occupiedSpots).toBe(644);
    expect(lot.usageRate).toBe(80.5);
  });

  it("list with keyword passes keyword param", async () => {
    server.use(
      http.get("/parking/v1/lots", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("keyword")).toBe("万科");
        return HttpResponse.json({
          parking_lots: [mockBackendLot],
          pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
        });
      })
    );

    await parkingLotService.list({ keyword: "万科" });
  });

  it("create calls POST /parking/v1/lots with mapped fields", async () => {
    server.use(
      http.post("/parking/v1/lots", async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        expect(body.name).toBe("新车场");
        expect(body.address).toBe("地址");
        expect(body.total_spaces).toBe(100);
        expect(body.lot_type).toBe("LOT_TYPE_GROUND");
        return HttpResponse.json({ parking_lot: { ...mockBackendLot, name: "新车场" } });
      })
    );

    const result = await parkingLotService.create({
      name: "新车场",
      address: "地址",
      totalSpots: 100,
    });
    expect(result.name).toBe("新车场");
  });

  it("update calls PATCH /parking/v1/lots/:id with mapped fields", async () => {
    server.use(
      http.patch("/parking/v1/lots/lot_001", async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        expect(body.name).toBe("新名称");
        return HttpResponse.json({ parking_lot: { ...mockBackendLot, name: "新名称" } });
      })
    );

    const result = await parkingLotService.update("lot_001", { name: "新名称" });
    expect(result.name).toBe("新名称");
  });

  it("delete calls DELETE /parking/v1/lots/:id", async () => {
    let called = false;
    server.use(
      http.delete("/parking/v1/lots/lot_001", () => {
        called = true;
        return HttpResponse.json({});
      })
    );

    await parkingLotService.delete("lot_001");
    expect(called).toBe(true);
  });

  it("getLaneConfig calls GET /api/parking-lots/:id/lanes (mock path)", async () => {
    const config = {
      lanes: [{ id: "lane_001", parkingLotId: "lot_001", name: "1号入口", type: "entry" }],
      availableDevices: [],
    };
    server.use(
      http.get("/api/parking-lots/lot_001/lanes", () => {
        return HttpResponse.json({ data: config });
      })
    );

    const result = await parkingLotService.getLaneConfig("lot_001");
    expect(result.lanes).toHaveLength(1);
  });

  it("updateLanes calls PUT /api/parking-lots/:id/lanes (mock path)", async () => {
    const updatedLanes = [
      { id: "lane_001", parkingLotId: "lot_001", name: "1号入口", type: "entry" as const },
    ];
    server.use(
      http.put("/api/parking-lots/lot_001/lanes", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ lanes: [{ name: "1号入口", type: "entry" }] });
        return HttpResponse.json({ data: updatedLanes });
      })
    );

    const result = await parkingLotService.updateLanes("lot_001", {
      lanes: [{ name: "1号入口", type: "entry" }],
    });
    expect(result).toHaveLength(1);
  });
});
