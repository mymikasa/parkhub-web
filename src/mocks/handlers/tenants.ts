import { http, HttpResponse, delay } from "msw";
import { mockTenants, getTenantSummary, getParkingLotsByTenantId } from "../data/tenants";
import type { BackendParkingLot } from "../data/parking-lots";
import type { ParkingLot } from "@/types";

function mapLotForClient(b: BackendParkingLot): ParkingLot {
  const totalSpots = b.total_spaces || 0;
  const availableSpots = b.available_spaces || 0;
  const occupiedSpots = Math.max(0, totalSpots - availableSpots);
  const lotTypeMap: Record<string, ParkingLot["type"]> = {
    LOT_TYPE_UNDERGROUND: "underground",
    LOT_TYPE_GROUND: "ground",
    LOT_TYPE_STEREO: "mechanical",
  };
  const statusMap: Record<string, ParkingLot["status"]> = {
    PARKING_LOT_STATUS_ACTIVE: "operating",
    PARKING_LOT_STATUS_INACTIVE: "suspended",
  };
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    type: lotTypeMap[b.lot_type || ""] || "ground",
    status: statusMap[b.status || ""] || "operating",
    totalSpots,
    availableSpots,
    occupiedSpots,
    usageRate: totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 1000) / 10 : 0,
    entryCount: 0,
    exitCount: 0,
    laneCount: 0,
    createdAt: b.created_at?.seconds
      ? new Date(Number(b.created_at.seconds) * 1000).toISOString()
      : "",
    updatedAt: b.updated_at?.seconds
      ? new Date(Number(b.updated_at.seconds) * 1000).toISOString()
      : "",
  };
}

export const tenantHandlers = [
  http.get("/api/v1/tenants/summary", async () => {
    await delay(150);
    return HttpResponse.json(getTenantSummary());
  }),

  http.get("/api/v1/tenants/:id/parking-lots", async ({ params }) => {
    await delay(150);
    const id = params.id as string;
    const tenant = mockTenants.find((t) => t.id === id);
    if (!tenant) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "租户不存在" },
        { status: 404 }
      );
    }
    const lots = getParkingLotsByTenantId(id);
    return HttpResponse.json({ parkingLots: lots.map(mapLotForClient) });
  }),
];
