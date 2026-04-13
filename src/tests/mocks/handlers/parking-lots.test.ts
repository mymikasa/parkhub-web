import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("parking-lots MSW handlers", () => {
  it("GET /api/parking-lots/summary returns summary data", async () => {
    const { mockParkingLots, mockLanes } = await import("@/mocks/data/parking-lots");
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots/summary");
    const json = await res.json();
    expect(json.data.totalSpots).toBe(mockParkingLots.reduce((s, l) => s + l.totalSpots, 0));
    expect(json.data.laneCount).toBe(mockLanes.length);
  });

  it("GET /api/parking-lots returns paginated list", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots?page=1&pageSize=2");
    const json = await res.json();
    expect(json.data.data).toHaveLength(2);
    expect(json.data.total).toBeGreaterThan(2);
    expect(json.data.page).toBe(1);
    expect(json.data.pageSize).toBe(2);
  });

  it("GET /api/parking-lots filters by keyword", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots?keyword=万科广场");
    const json = await res.json();
    expect(json.data.data.length).toBeGreaterThan(0);
    json.data.data.forEach((lot: { name: string }) => {
      expect(lot.name).toContain("万科广场");
    });
  });

  it("POST /api/parking-lots creates a new lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "测试车场", address: "测试地址", totalSpots: 100 }),
    });
    const json = await res.json();
    expect(json.data.name).toBe("测试车场");
    expect(json.data.totalSpots).toBe(100);
    expect(json.data.status).toBe("operating");
  });

  it("PATCH /api/parking-lots/:id updates a lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots/lot_001", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "更新名称" }),
    });
    const json = await res.json();
    expect(json.data.name).toBe("更新名称");
  });

  it("PATCH /api/parking-lots/:id returns 404 for non-existent lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots/lot_nonexistent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "测试" }),
    });
    expect(res.status).toBe(404);
  });

  it("GET /api/parking-lots/:id/lanes returns lane config", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots/lot_001/lanes");
    const json = await res.json();
    expect(Array.isArray(json.data.lanes)).toBe(true);
    expect(json.data.lanes.length).toBeGreaterThan(0);
    expect(Array.isArray(json.data.availableDevices)).toBe(true);
  });

  it("PUT /api/parking-lots/:id/lanes updates lanes", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/api/parking-lots/lot_001/lanes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lanes: [
          { name: "1号入口", type: "entry" },
          { name: "1号出口", type: "exit" },
        ],
      }),
    });
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.data[0].type).toBe("entry");
    expect(json.data[1].type).toBe("exit");
  });
});
