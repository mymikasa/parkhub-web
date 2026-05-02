import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { deviceService } from "@/lib/api/devices";

const mockDevice = {
  id: "DEV-001",
  tenant_id: "tenant-001",
  name: "入口摄像头",
  type: "integrated",
  status: "active",
  firmware_version: "v1.0.0",
  last_heartbeat: "2024-12-21T10:00:00Z",
  parking_lot_id: "lot_001",
  gate_id: "gate_001",
  created_at: "2024-12-20T10:00:00Z",
  updated_at: "2024-12-21T10:00:00Z",
};

const mockStats = {
  total: 20,
  active: 12,
  offline: 3,
  pending: 3,
  disabled: 2,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("deviceService", () => {
  it("getStats calls GET /iot/v1/devices/stats", async () => {
    server.use(
      http.get("/iot/v1/devices/stats", () => {
        return HttpResponse.json(mockStats);
      }),
    );

    const result = await deviceService.getStats();
    expect(result.total).toBe(20);
    expect(result.active).toBe(12);
  });

  it("list calls GET /iot/v1/devices with filters", async () => {
    server.use(
      http.get("/iot/v1/devices", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("DEVICE_STATUS_ACTIVE");
        expect(url.searchParams.get("page")).toBe("1");
        return HttpResponse.json({
          devices: [mockDevice],
          pagination: { page: 1, page_size: 10, total: 1 },
        });
      }),
    );

    const result = await deviceService.list({ page: 1, pageSize: 10, status: "active" });
    expect(result.data).toHaveLength(1);
  });

  it("create calls POST /iot/v1/devices", async () => {
    server.use(
      http.post("/iot/v1/devices", async () => {
        return HttpResponse.json({ device: { ...mockDevice, id: "DEV-NEW" } });
      }),
    );

    const result = await deviceService.create({ id: "DEV-NEW", type: "integrated" });
    expect(result.id).toBe("DEV-NEW");
  });

  it("updateName calls PATCH /iot/v1/devices/:id", async () => {
    server.use(
      http.patch("/iot/v1/devices/DEV-001", async () => {
        return HttpResponse.json({ device: { ...mockDevice, name: "新名称" } });
      }),
    );

    const result = await deviceService.updateName("DEV-001", { name: "新名称" });
    expect(result.name).toBe("新名称");
  });

  it("delete calls DELETE /iot/v1/devices/:id", async () => {
    server.use(
      http.delete("/iot/v1/devices/DEV-001", () => {
        return HttpResponse.json({});
      }),
    );

    await expect(deviceService.delete("DEV-001")).resolves.toBeUndefined();
  });

  it("bind calls POST /iot/v1/devices/:id/bind", async () => {
    server.use(
      http.post("/iot/v1/devices/DEV-001/bind", async () => {
        return HttpResponse.json({ device: { ...mockDevice, status: "active" } });
      }),
    );

    const result = await deviceService.bind("DEV-001", { parkingLotId: "lot_001", gateId: "gate_001" });
    expect(result.status).toBe("active");
  });

  it("sendCommand calls POST /iot/v1/devices/:id/command", async () => {
    server.use(
      http.post("/iot/v1/devices/DEV-001/command", async () => {
        return HttpResponse.json({ success: true, message: "抬杆指令已发送" });
      }),
    );

    const result = await deviceService.sendCommand("DEV-001", { action: "up" });
    expect(result.success).toBe(true);
  });

  it("batchDisable calls POST /iot/v1/devices/batch/disable", async () => {
    server.use(
      http.post("/iot/v1/devices/batch/disable", async () => {
        return HttpResponse.json({ affected: 2 });
      }),
    );

    const result = await deviceService.batchDisable({ ids: ["DEV-001", "DEV-002"] });
    expect(result.affected).toBe(2);
  });
});
