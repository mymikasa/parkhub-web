import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("parking-lots MSW handlers", () => {
  it("GET /parking/v1/lots/stats returns stats data", async () => {
    const { mockParkingLots } = await import("@/mocks/data/parking-lots");
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots/stats");
    const json = await res.json();
    expect(json.total_spaces).toBe(mockParkingLots.reduce((s, l) => s + l.total_spaces, 0));
    expect(json.total_gates).toBeGreaterThan(0);
  });

  it("GET /parking/v1/lots returns paginated list", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots?page=1&page_size=2");
    const json = await res.json();
    expect(json.parking_lots).toHaveLength(2);
    expect(json.pagination.total).toBeGreaterThan(2);
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.page_size).toBe(2);
  });

  it("GET /parking/v1/lots filters by keyword", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots?keyword=万科广场");
    const json = await res.json();
    expect(json.parking_lots.length).toBeGreaterThan(0);
    json.parking_lots.forEach((lot: { name: string }) => {
      expect(lot.name).toContain("万科广场");
    });
  });

  it("POST /parking/v1/lots creates a new lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "测试车场", address: "测试地址", total_spaces: 100, lot_type: "LOT_TYPE_GROUND" }),
    });
    const json = await res.json();
    expect(json.parking_lot.name).toBe("测试车场");
    expect(json.parking_lot.total_spaces).toBe(100);
    expect(json.parking_lot.status).toBe("PARKING_LOT_STATUS_ACTIVE");
  });

  it("PATCH /parking/v1/lots/:id updates a lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots/lot_001", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "更新名称" }),
    });
    const json = await res.json();
    expect(json.parking_lot.name).toBe("更新名称");
  });

  it("PATCH /parking/v1/lots/:id returns 404 for non-existent lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots/lot_nonexistent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "测试" }),
    });
    expect(res.status).toBe(404);
  });

  it("GET /api/parking-lots/:id/lanes returns lane config (mock path)", async () => {
    const { parkingLotHandlers, laneHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers, ...laneHandlers);

    const res = await fetch("/api/parking-lots/lot_001/lanes");
    const json = await res.json();
    expect(Array.isArray(json.data.lanes)).toBe(true);
    expect(json.data.lanes.length).toBeGreaterThan(0);
    expect(Array.isArray(json.data.availableDevices)).toBe(true);
  });

  it("PUT /api/parking-lots/:id/lanes updates lanes (mock path)", async () => {
    const { parkingLotHandlers, laneHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers, ...laneHandlers);

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

  it("DELETE /parking/v1/lots/:id deletes a lot", async () => {
    const { parkingLotHandlers } = await import("@/mocks/handlers/parking-lots");
    server.use(...parkingLotHandlers);

    const res = await fetch("/parking/v1/lots/lot_002", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });
});
