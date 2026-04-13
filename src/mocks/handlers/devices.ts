import { http, HttpResponse, delay } from "msw";
import { mockDevices, getDeviceSummary } from "../data/devices";
import { mockParkingLots, mockLanes } from "../data/parking-lots";
import type { Device, DeviceType } from "@/types";

let deviceIdCounter = mockDevices.length;

export const deviceHandlers = [
  http.get("/api/devices/summary", async () => {
    await delay(200);
    return HttpResponse.json({ data: getDeviceSummary() });
  }),

  http.get("/api/devices", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const status = url.searchParams.get("status");
    const parkingLotId = url.searchParams.get("parkingLotId");
    const keyword = url.searchParams.get("keyword");

    let filtered = [...mockDevices];

    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (parkingLotId) {
      filtered = filtered.filter((d) => d.parkingLotId === parkingLotId);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.serialNumber.toLowerCase().includes(kw) ||
          d.name.toLowerCase().includes(kw) ||
          d.parkingLotName.toLowerCase().includes(kw)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: { data, total, page, pageSize },
    });
  }),

  http.post("/api/devices", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      serialNumber: string;
      parkingLotId: string;
      laneId: string;
      type: DeviceType;
    };

    // Check serial number uniqueness
    if (mockDevices.some((d) => d.serialNumber === body.serialNumber)) {
      return HttpResponse.json(
        { code: "DUPLICATE", message: "设备序列号已存在" },
        { status: 400 }
      );
    }

    const lot = mockParkingLots.find((l) => l.id === body.parkingLotId);
    const lane = mockLanes.find((l) => l.id === body.laneId);

    deviceIdCounter++;
    const newDevice: Device = {
      id: `dev_${String(deviceIdCounter).padStart(3, "0")}`,
      serialNumber: body.serialNumber,
      name: body.serialNumber,
      type: body.type,
      status: "online",
      parkingLotId: lot?.id ?? body.parkingLotId,
      parkingLotName: lot?.name ?? "未知车场",
      laneName: lane?.name ?? "未知出入口",
      laneType: lane?.type ?? "entry",
      lastHeartbeat: new Date().toISOString(),
      todayTraffic: 0,
    };

    mockDevices.push(newDevice);
    return HttpResponse.json({ data: newDevice });
  }),

  http.post("/api/devices/:id/command", async ({ params, request }) => {
    await delay(500);
    const id = params.id as string;
    const device = mockDevices.find((d) => d.id === id);

    if (!device) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "设备不存在" },
        { status: 404 }
      );
    }

    if (device.status === "offline") {
      return HttpResponse.json(
        { code: "DEVICE_OFFLINE", message: "设备离线，无法执行操作" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { action: "up" | "down" };
    const actionText = body.action === "up" ? "抬杆" : "落杆";

    return HttpResponse.json({
      data: { success: true, message: `${actionText}指令已发送` },
    });
  }),
];
