import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("devices MSW handlers", () => {
  it("GET /api/devices/summary returns device summary", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices/summary");
    const json = await res.json();
    expect(json.data.total).toBeGreaterThan(0);
    expect(json.data.online).toBeGreaterThan(0);
    expect(json.data.offline).toBeGreaterThanOrEqual(0);
    expect(json.data.onlineRate).toBeGreaterThan(0);
  });

  it("GET /api/devices returns paginated devices", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices?page=1&pageSize=5");
    const json = await res.json();
    expect(json.data.data.length).toBeLessThanOrEqual(5);
    expect(json.data.total).toBeGreaterThan(0);
  });

  it("GET /api/devices filters by status", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices?status=offline");
    const json = await res.json();
    json.data.data.forEach((d: { status: string }) => {
      expect(d.status).toBe("offline");
    });
  });

  it("GET /api/devices filters by keyword", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices?keyword=PH-DEV-2024-001");
    const json = await res.json();
    expect(json.data.data.length).toBeGreaterThan(0);
  });

  it("POST /api/devices registers a new device", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serialNumber: "PH-NEW-TEST-001",
        parkingLotId: "lot_001",
        laneId: "lane_001",
        type: "integrated",
      }),
    });
    const json = await res.json();
    expect(json.data.serialNumber).toBe("PH-NEW-TEST-001");
    expect(json.data.status).toBe("online");
  });

  it("POST /api/devices rejects duplicate serial number", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serialNumber: "PH-DEV-2024-001",
        parkingLotId: "lot_001",
        laneId: "lane_001",
        type: "integrated",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/devices/:id/command sends command to online device", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const onlineDevice = mockDevices.find((d) => d.status === "online");
    if (!onlineDevice) throw new Error("No online device found");

    const res = await fetch(`/api/devices/${onlineDevice.id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "up" }),
    });
    const json = await res.json();
    expect(json.data.success).toBe(true);
  });

  it("POST /api/devices/:id/command returns 400 for offline device", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const offlineDevice = mockDevices.find((d) => d.status === "offline");
    if (!offlineDevice) throw new Error("No offline device found");

    const res = await fetch(`/api/devices/${offlineDevice.id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "up" }),
    });
    expect(res.status).toBe(400);
  });
});
