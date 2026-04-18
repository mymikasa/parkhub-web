import { http, HttpResponse, delay } from "msw";
import { mockDevices, getDeviceStats } from "../data/devices";
import type { Device, DeviceType } from "@/types";

function copyDevice(d: Device): Device {
  return { ...d };
}

export const deviceHandlers = [
  http.get("/iot/v1/devices/stats", async () => {
    await delay(200);
    return HttpResponse.json(getDeviceStats());
  }),

  http.get("/iot/v1/devices", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("page_size")) || 10;
    const status = url.searchParams.get("status");
    const parkingLotId = url.searchParams.get("parking_lot_id");
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
          d.id.toLowerCase().includes(kw) ||
          (d.name && d.name.toLowerCase().includes(kw)),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      devices: data,
      pagination: { page, page_size: pageSize, total, total_pages: Math.ceil(total / pageSize) },
    });
  }),

  http.get("/iot/v1/devices/:id", async ({ params }) => {
    await delay(200);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { id: string; name?: string; type: string; firmware_version?: string };

    if (mockDevices.some((d) => d.id === body.id)) {
      return HttpResponse.json({ code: "DUPLICATE", message: "设备ID已存在" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newDevice: Device = {
      id: body.id,
      tenantId: "tenant-001",
      name: body.name || body.id,
      type: (body.type as DeviceType) || "integrated",
      status: "pending",
      firmwareVersion: body.firmware_version || "",
      lastHeartbeat: null,
      parkingLotId: null,
      gateId: null,
      createdAt: now,
      updatedAt: now,
    };

    mockDevices.push(newDevice);
    return HttpResponse.json({ device: copyDevice(newDevice) });
  }),

  http.patch("/iot/v1/devices/:id", async ({ params, request }) => {
    await delay(300);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    const body = (await request.json()) as { name: string };
    device.name = body.name;
    device.updatedAt = new Date().toISOString();
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices/batch/disable", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[] };
    let affected = 0;
    for (const id of body.ids) {
      const d = mockDevices.find((x) => x.id === id);
      if (d && d.status !== "disabled") {
        d.status = "disabled";
        d.updatedAt = new Date().toISOString();
        affected++;
      }
    }
    return HttpResponse.json({ affected });
  }),

  http.post("/iot/v1/devices/batch/enable", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[] };
    let affected = 0;
    for (const id of body.ids) {
      const d = mockDevices.find((x) => x.id === id);
      if (d && d.status === "disabled") {
        d.status = d.parkingLotId ? "active" : "pending";
        d.updatedAt = new Date().toISOString();
        affected++;
      }
    }
    return HttpResponse.json({ affected });
  }),

  http.post("/iot/v1/devices/batch/delete", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[] };
    let affected = 0;
    for (const id of body.ids) {
      const idx = mockDevices.findIndex((x) => x.id === id);
      if (idx !== -1 && !mockDevices[idx].parkingLotId) {
        mockDevices.splice(idx, 1);
        affected++;
      }
    }
    return HttpResponse.json({ affected });
  }),

  http.post("/iot/v1/devices/batch/bind", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { bindings: Array<{ id: string; parking_lot_id: string; gate_id: string }> };
    let affected = 0;
    for (const b of body.bindings) {
      const d = mockDevices.find((x) => x.id === b.id);
      if (d && d.status === "pending") {
        d.parkingLotId = b.parking_lot_id;
        d.gateId = b.gate_id;
        d.status = "active";
        d.lastHeartbeat = new Date().toISOString();
        d.updatedAt = new Date().toISOString();
        affected++;
      }
    }
    return HttpResponse.json({ affected });
  }),

  http.delete("/iot/v1/devices/:id", async ({ params }) => {
    await delay(300);
    const idx = mockDevices.findIndex((d) => d.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (mockDevices[idx].parkingLotId) {
      return HttpResponse.json({ code: "DEVICE_BOUND", message: "设备已绑定，需先解绑" }, { status: 412 });
    }
    mockDevices.splice(idx, 1);
    return HttpResponse.json({});
  }),

  http.post("/iot/v1/devices/:id/bind", async ({ params, request }) => {
    await delay(400);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (device.status !== "pending") {
      return HttpResponse.json({ code: "INVALID_STATE", message: "设备状态不允许绑定" }, { status: 412 });
    }
    const body = (await request.json()) as { parking_lot_id: string; gate_id: string };
    device.parkingLotId = body.parking_lot_id;
    device.gateId = body.gate_id;
    device.status = "active";
    device.lastHeartbeat = new Date().toISOString();
    device.updatedAt = new Date().toISOString();
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices/:id/unbind", async ({ params }) => {
    await delay(300);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (!device.parkingLotId) {
      return HttpResponse.json({ code: "NOT_BOUND", message: "设备未绑定" }, { status: 412 });
    }
    device.parkingLotId = null;
    device.gateId = null;
    device.status = "pending";
    device.updatedAt = new Date().toISOString();
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices/:id/disable", async ({ params }) => {
    await delay(300);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (device.status === "disabled") {
      return HttpResponse.json({ code: "ALREADY_DISABLED", message: "设备已停用" }, { status: 412 });
    }
    device.status = "disabled";
    device.updatedAt = new Date().toISOString();
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices/:id/enable", async ({ params }) => {
    await delay(300);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (device.status !== "disabled") {
      return HttpResponse.json({ code: "INVALID_STATE", message: "设备状态不允许启用" }, { status: 412 });
    }
    device.status = device.parkingLotId ? "active" : "pending";
    device.updatedAt = new Date().toISOString();
    return HttpResponse.json({ device: copyDevice(device) });
  }),

  http.post("/iot/v1/devices/:id/command", async ({ params, request }) => {
    await delay(500);
    const device = mockDevices.find((d) => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ code: "NOT_FOUND", message: "设备不存在" }, { status: 404 });
    }
    if (device.status !== "active") {
      return HttpResponse.json({ code: "DEVICE_OFFLINE", message: "设备离线或已停用" }, { status: 412 });
    }
    const body = (await request.json()) as { action: "up" | "down" };
    const actionText = body.action === "up" ? "抬杆" : "落杆";
    return HttpResponse.json({ success: true, message: `${actionText}指令已发送` });
  }),
];
