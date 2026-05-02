import { http, HttpResponse, delay } from "msw";
import {
  mockParkingLots,
  mockLanes,
  mockLaneDevices,
  getParkingLotStats,
  getLaneConfigByParkingLotId,
} from "../data/parking-lots";
import type { BackendParkingLot } from "../data/parking-lots";

let lotIdCounter = mockParkingLots.length;
let laneIdCounter = mockLanes.length;

function nowTimestamp() {
  const ms = Date.now();
  return { seconds: String(Math.floor(ms / 1000)), nanos: (ms % 1000) * 1e6 };
}

export const parkingLotHandlers = [
  http.get("/parking/v1/lots/stats", async () => {
    await delay(300);
    return HttpResponse.json(getParkingLotStats());
  }),

  http.get("/parking/v1/lots", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("page_size")) || 10;
    const keyword = url.searchParams.get("keyword") || "";
    const statusFilter = url.searchParams.get("status") || "";
    const lotTypeFilter = url.searchParams.get("lot_type") || "";

    let filtered = mockParkingLots;
    if (keyword) {
      filtered = filtered.filter((lot) =>
        lot.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((lot) => lot.status === statusFilter);
    }
    if (lotTypeFilter) {
      filtered = filtered.filter((lot) => lot.lot_type === lotTypeFilter);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const parkingLots = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      parking_lots: parkingLots,
      pagination: { page, page_size: pageSize, total, total_pages: totalPages },
    });
  }),

  http.post("/parking/v1/lots", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      name: string;
      address: string;
      total_spaces: number;
      lot_type?: string;
    };

    lotIdCounter++;
    const now = nowTimestamp();
    const newLot: BackendParkingLot = {
      id: `lot_${String(lotIdCounter).padStart(3, "0")}`,
      tenant_id: "tenant_001",
      name: body.name,
      address: body.address,
      total_spaces: body.total_spaces,
      available_spaces: body.total_spaces,
      lot_type: body.lot_type || "LOT_TYPE_GROUND",
      status: "PARKING_LOT_STATUS_ACTIVE",
      created_at: now,
      updated_at: now,
    };

    mockParkingLots.push(newLot);
    return HttpResponse.json({ parking_lot: newLot });
  }),

  http.get("/parking/v1/lots/:id", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const lot = mockParkingLots.find((l) => l.id === id);
    if (!lot) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }
    return HttpResponse.json({ parking_lot: lot });
  }),

  http.patch("/parking/v1/lots/:id", async ({ params, request }) => {
    await delay(300);
    const id = params.id as string;
    const body = (await request.json()) as Partial<Record<string, unknown>>;
    const lot = mockParkingLots.find((l) => l.id === id);

    if (!lot) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }

    if (body.name !== undefined) lot.name = String(body.name);
    if (body.address !== undefined) lot.address = String(body.address);
    if (body.total_spaces !== undefined) {
      lot.total_spaces = Number(body.total_spaces);
      lot.available_spaces = lot.total_spaces - (lot.total_spaces - lot.available_spaces);
    }
    if (body.lot_type !== undefined) lot.lot_type = String(body.lot_type);
    if (body.status !== undefined) {
      lot.status = String(body.status);
      if (body.status === "PARKING_LOT_STATUS_INACTIVE") {
        lot.available_spaces = lot.total_spaces;
      }
    }
    lot.updated_at = nowTimestamp();

    return HttpResponse.json({ parking_lot: lot });
  }),

  http.delete("/parking/v1/lots/:id", async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const idx = mockParkingLots.findIndex((l) => l.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "停车场不存在" },
        { status: 404 }
      );
    }
    mockParkingLots.splice(idx, 1);
    return HttpResponse.json({});
  }),
];

export const laneHandlers = [
  http.get("/api/parking-lots/:id/lanes", async ({ params }) => {
    await delay(200);
    const id = params.id as string;

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

    return HttpResponse.json({ data: updatedLanes });
  }),
];
