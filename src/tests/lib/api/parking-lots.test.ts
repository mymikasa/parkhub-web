import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { parkingLotService } from "@/lib/api/parking-lots";

const mockSummary = {
  totalSpots: 3450,
  availableSpots: 880,
  occupiedSpots: 2201,
  laneCount: 29,
};

const mockLot = {
  id: "lot_001",
  name: "万科翡翠滨江地下停车场",
  address: "上海市浦东新区陆家嘴环路1000号",
  type: "underground",
  status: "operating",
  totalSpots: 800,
  availableSpots: 156,
  occupiedSpots: 644,
  usageRate: 80.5,
  entryCount: 3,
  exitCount: 3,
  laneCount: 6,
  createdAt: "2024-01-15T08:00:00Z",
  updatedAt: "2024-12-20T14:30:00Z",
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("parkingLotService", () => {
  it("getSummary calls GET /api/parking-lots/summary", async () => {
    server.use(
      http.get("/api/parking-lots/summary", () => {
        return HttpResponse.json({ data: mockSummary });
      })
    );

    const result = await parkingLotService.getSummary();
    expect(result).toEqual(mockSummary);
  });

  it("list calls GET /api/parking-lots with params", async () => {
    server.use(
      http.get("/api/parking-lots", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("pageSize")).toBe("10");
        return HttpResponse.json({
          data: { data: [mockLot], total: 1, page: 1, pageSize: 10 },
        });
      })
    );

    const result = await parkingLotService.list({ page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("list with keyword passes keyword param", async () => {
    server.use(
      http.get("/api/parking-lots", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("keyword")).toBe("万科");
        return HttpResponse.json({
          data: { data: [mockLot], total: 1, page: 1, pageSize: 10 },
        });
      })
    );

    await parkingLotService.list({ keyword: "万科" });
  });

  it("create calls POST /api/parking-lots", async () => {
    const newLot = { ...mockLot, id: "lot_new", name: "新车场" };
    server.use(
      http.post("/api/parking-lots", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ name: "新车场", address: "地址", totalSpots: 100 });
        return HttpResponse.json({ data: newLot });
      })
    );

    const result = await parkingLotService.create({
      name: "新车场",
      address: "地址",
      totalSpots: 100,
    });
    expect(result.name).toBe("新车场");
  });

  it("update calls PATCH /api/parking-lots/:id", async () => {
    server.use(
      http.patch("/api/parking-lots/lot_001", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ name: "新名称" });
        return HttpResponse.json({ data: { ...mockLot, name: "新名称" } });
      })
    );

    const result = await parkingLotService.update("lot_001", { name: "新名称" });
    expect(result.name).toBe("新名称");
  });

  it("getLaneConfig calls GET /api/parking-lots/:id/lanes", async () => {
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

  it("updateLanes calls PUT /api/parking-lots/:id/lanes", async () => {
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
