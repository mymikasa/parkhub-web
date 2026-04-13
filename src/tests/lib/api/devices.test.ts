import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { deviceService } from "@/lib/api/devices";

const mockDevice = {
  id: "dev_001",
  serialNumber: "PH-DEV-2024-001",
  name: "PH-DEV-2024-001",
  type: "integrated",
  status: "online",
  parkingLotId: "lot_001",
  parkingLotName: "万科翡翠滨江地下停车场",
  laneName: "1号入口",
  laneType: "entry",
  lastHeartbeat: "2024-12-21T10:00:00Z",
  todayTraffic: 120,
};

const mockSummary = {
  total: 15,
  online: 12,
  offline: 3,
  todayTraffic: 1500,
  onlineRate: 80.0,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("deviceService", () => {
  it("getSummary calls GET /api/devices/summary", async () => {
    server.use(
      http.get("/api/devices/summary", () => {
        return HttpResponse.json({ data: mockSummary });
      })
    );

    const result = await deviceService.getSummary();
    expect(result).toEqual(mockSummary);
  });

  it("list calls GET /api/devices with filters", async () => {
    server.use(
      http.get("/api/devices", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("online");
        expect(url.searchParams.get("page")).toBe("1");
        return HttpResponse.json({
          data: { data: [mockDevice], total: 1, page: 1, pageSize: 10 },
        });
      })
    );

    const result = await deviceService.list({ page: 1, pageSize: 10, status: "online" });
    expect(result.data).toHaveLength(1);
  });

  it("register calls POST /api/devices", async () => {
    server.use(
      http.post("/api/devices", async ({ request }) => {
        const body = (await request.json()) as Record<string, string>;
        expect(body.serialNumber).toBe("PH-NEW-001");
        return HttpResponse.json({ data: { ...mockDevice, id: "dev_new", serialNumber: "PH-NEW-001" } });
      })
    );

    const result = await deviceService.register({
      serialNumber: "PH-NEW-001",
      parkingLotId: "lot_001",
      laneId: "lane_001",
      type: "integrated",
    });
    expect(result.serialNumber).toBe("PH-NEW-001");
  });

  it("sendCommand calls POST /api/devices/:id/command", async () => {
    server.use(
      http.post("/api/devices/dev_001/command", async ({ request }) => {
        const body = (await request.json()) as Record<string, string>;
        expect(body.action).toBe("up");
        return HttpResponse.json({ data: { success: true, message: "抬杆指令已发送" } });
      })
    );

    const result = await deviceService.sendCommand("dev_001", { action: "up" });
    expect(result.success).toBe(true);
  });
});
