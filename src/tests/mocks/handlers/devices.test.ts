import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("devices MSW handlers", () => {
  it("GET /iot/v1/devices/stats returns device stats", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/iot/v1/devices/stats");
    const json = await res.json();
    expect(json.total).toBeGreaterThan(0);
    expect(json.active).toBeGreaterThanOrEqual(0);
    expect(json.offline).toBeGreaterThanOrEqual(0);
    expect(json.pending).toBeGreaterThanOrEqual(0);
    expect(json.disabled).toBeGreaterThanOrEqual(0);
  });

  it("GET /iot/v1/devices returns paginated devices", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/iot/v1/devices?page=1&page_size=5");
    const json = await res.json();
    expect(json.devices.length).toBeLessThanOrEqual(5);
    expect(json.pagination.total).toBeGreaterThan(0);
  });

  it("GET /iot/v1/devices filters by status", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/iot/v1/devices?status=offline");
    const json = await res.json();
    json.devices.forEach((d: { status: string }) => {
      expect(d.status).toBe("offline");
    });
  });

  it("POST /iot/v1/devices creates a new device with pending status", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    server.use(...deviceHandlers);

    const res = await fetch("/iot/v1/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "NEW-DEVICE-999", type: "integrated" }),
    });
    const json = await res.json();
    expect(json.device.id).toBe("NEW-DEVICE-999");
    expect(json.device.status).toBe("pending");
  });

  it("POST /iot/v1/devices rejects duplicate id", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const existingId = mockDevices[0].id;
    const res = await fetch("/iot/v1/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: existingId, type: "integrated" }),
    });
    expect(res.status).toBe(409);
  });

  it("POST /iot/v1/devices/:id/command sends command to active device", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const activeDevice = mockDevices.find((d) => d.status === "active");
    if (!activeDevice) throw new Error("No active device found");

    const res = await fetch(`/iot/v1/devices/${activeDevice.id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "up" }),
    });
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("POST /iot/v1/devices/:id/command rejects offline device", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const offlineDevice = mockDevices.find((d) => d.status === "offline");
    if (!offlineDevice) throw new Error("No offline device found");

    const res = await fetch(`/iot/v1/devices/${offlineDevice.id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "up" }),
    });
    expect(res.status).toBe(412);
  });

  it("POST /iot/v1/devices/:id/disable changes device status", async () => {
    const { deviceHandlers } = await import("@/mocks/handlers/devices");
    const { mockDevices } = await import("@/mocks/data/devices");
    server.use(...deviceHandlers);

    const activeDevice = mockDevices.find((d) => d.status === "active");
    if (!activeDevice) throw new Error("No active device found");

    const res = await fetch(`/iot/v1/devices/${activeDevice.id}/disable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    expect(json.device.status).toBe("disabled");
  });

  it("POST /iot/v1/devices/batch/disable returns affected count", async () => {
    const mod = await import("@/mocks/handlers/devices");
    server.use(...mod.deviceHandlers);

    await fetch("/iot/v1/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "batch-a", type: "integrated" }),
    });
    await fetch("/iot/v1/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "batch-b", type: "camera_only" }),
    });

    const res = await fetch("/iot/v1/devices/batch/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["batch-a", "batch-b"] }),
    });
    const json = await res.json();
    expect(json.affected).toBeGreaterThanOrEqual(0);
  });
});
