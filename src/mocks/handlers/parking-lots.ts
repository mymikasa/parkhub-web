import { http, HttpResponse, delay } from "msw";
import {
  mockParkingLots,
  mockLanes,
  mockLaneDevices,
  getParkingLotSummary,
  getLaneConfigByParkingLotId,
} from "../data/parking-lots";
import type { ParkingLot } from "@/types";

let lotIdCounter = mockParkingLots.length;
let laneIdCounter = mockLanes.length;

export const parkingLotHandlers = [
  http.get("/api/parking-lots/summary", async () => {
    await delay(300);
    return HttpResponse.json({ data: getParkingLotSummary() });
  }),

  http.get("/api/parking-lots", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword") || "";

    let filtered = mockParkingLots;
    if (keyword) {
      filtered = filtered.filter((lot) =>
        lot.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: { data, total, page, pageSize },
    });
  }),

  http.post("/api/parking-lots", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      name: string;
      address: string;
      totalSpots: number;
      type?: string;
    };

    lotIdCounter++;
    const newLot: ParkingLot = {
      id: `lot_${String(lotIdCounter).padStart(3, "0")}`,
      name: body.name,
      address: body.address,
      type: (body.type as ParkingLot["type"]) || "ground",
      status: "operating",
      totalSpots: body.totalSpots,
      availableSpots: body.totalSpots,
      occupiedSpots: 0,
      usageRate: 0,
      entryCount: 0,
      exitCount: 0,
      laneCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockParkingLots.push(newLot);
    return HttpResponse.json({ data: newLot });
  }),

  http.patch("/api/parking-lots/:id", async ({ params, request }) => {
    await delay(300);
    const id = params.id as string;
    const body = (await request.json()) as Partial<ParkingLot>;
    const lot = mockParkingLots.find((l) => l.id === id);

    if (!lot) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }

    if (body.name !== undefined) lot.name = body.name;
    if (body.address !== undefined) lot.address = body.address;
    if (body.totalSpots !== undefined) {
      lot.totalSpots = body.totalSpots;
      lot.availableSpots = body.totalSpots - lot.occupiedSpots;
      lot.usageRate =
        lot.totalSpots > 0
          ? Math.round((lot.occupiedSpots / lot.totalSpots) * 1000) / 10
          : 0;
    }
    if (body.type !== undefined) lot.type = body.type;
    if (body.status !== undefined) {
      lot.status = body.status;
      if (body.status === "suspended") {
        lot.occupiedSpots = 0;
        lot.availableSpots = lot.totalSpots;
        lot.usageRate = 0;
      }
    }
    lot.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: lot });
  }),

  http.get("/api/parking-lots/:id/lanes", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const lot = mockParkingLots.find((l) => l.id === id);

    if (!lot) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }

    const config = getLaneConfigByParkingLotId(id);
    return HttpResponse.json({ data: config });
  }),

  http.put("/api/parking-lots/:id/lanes", async ({ params, request }) => {
    await delay(600);
    const id = params.id as string;
    const body = (await request.json()) as {
      lanes: Array<{
        id?: string;
        name: string;
        type: string;
        deviceId?: string;
      }>;
    };

    const lot = mockParkingLots.find((l) => l.id === id);
    if (!lot) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }

    const existingIndex = mockLanes.findIndex((l) => l.parkingLotId === id);
    if (existingIndex !== -1) {
      const idx = mockLanes.findIndex((l) => l.parkingLotId === id);
      while (idx !== -1) {
        mockLanes.splice(idx, 1);
        const nextIdx = mockLanes.findIndex((l) => l.parkingLotId === id);
        if (nextIdx === -1 || nextIdx >= mockLanes.length) break;
        if (nextIdx === idx) break;
      }
    }
    mockLanes.filter = mockLanes.filter.bind(mockLanes);
    const toRemove = mockLanes.filter((l) => l.parkingLotId === id);
    for (const lane of toRemove) {
      const i = mockLanes.indexOf(lane);
      if (i !== -1) mockLanes.splice(i, 1);
    }

    const updatedLanes = body.lanes.map((laneData) => {
      const device = laneData.deviceId
        ? mockLaneDevices.find((d) => d.id === laneData.deviceId)
        : undefined;

      if (laneData.id) {
        return {
          id: laneData.id,
          parkingLotId: id,
          name: laneData.name,
          type: laneData.type as "entry" | "exit",
          device: device ? { ...device } : undefined,
        };
      }

      laneIdCounter++;
      return {
        id: `lane_${String(laneIdCounter).padStart(3, "0")}`,
        parkingLotId: id,
        name: laneData.name,
        type: laneData.type as "entry" | "exit",
        device: device ? { ...device } : undefined,
      };
    });

    mockLanes.push(...updatedLanes);

    lot.entryCount = updatedLanes.filter((l) => l.type === "entry").length;
    lot.exitCount = updatedLanes.filter((l) => l.type === "exit").length;
    lot.laneCount = updatedLanes.length;
    lot.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: updatedLanes });
  }),
];
