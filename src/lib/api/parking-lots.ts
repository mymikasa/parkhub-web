import { apiClient } from "./client";
import type {
  ParkingLot,
  ParkingLotSummary,
  Lane,
  LaneConfigResponse,
  DeviceOption,
  CreateParkingLotRequest,
  UpdateParkingLotRequest,
  UpdateLanesRequest,
  PaginatedResponse,
  ParkingLotType,
  ParkingLotStatus,
  DeviceOnlineStatus,
} from "@/types";

const LOT_TYPE_TO_BACKEND: Record<ParkingLotType, string> = {
  underground: "LOT_TYPE_UNDERGROUND",
  ground: "LOT_TYPE_GROUND",
  mechanical: "LOT_TYPE_STEREO",
};

const LOT_TYPE_FROM_BACKEND: Record<string, ParkingLotType> = {
  LOT_TYPE_UNDERGROUND: "underground",
  LOT_TYPE_GROUND: "ground",
  LOT_TYPE_STEREO: "mechanical",
};

const LOT_STATUS_FROM_BACKEND: Record<string, ParkingLotStatus> = {
  PARKING_LOT_STATUS_ACTIVE: "operating",
  PARKING_LOT_STATUS_INACTIVE: "suspended",
};

interface CamelTimestamp {
  seconds?: string | number;
  nanos?: number;
}

interface CamelParkingLot {
  id: string;
  tenantId?: string;
  name: string;
  address: string;
  totalSpaces: number;
  availableSpaces: number;
  lotType?: string;
  status?: string;
  entryCount?: number;
  exitCount?: number;
  createdAt?: CamelTimestamp;
  updatedAt?: CamelTimestamp;
}

interface CamelPagination {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

function timestampToISO(ts?: CamelTimestamp): string {
  if (!ts?.seconds) return "";
  const ms = (Number(ts.seconds) || 0) * 1000 + Math.floor((ts.nanos || 0) / 1e6);
  return new Date(ms).toISOString();
}

function mapParkingLot(b: CamelParkingLot): ParkingLot {
  const totalSpaces = b.totalSpaces || 0;
  const availableSpaces = b.availableSpaces || 0;
  const occupiedSpots = Math.max(0, totalSpaces - availableSpaces);
  const usageRate = totalSpaces > 0 ? Math.round((occupiedSpots / totalSpaces) * 1000) / 10 : 0;

  return {
    id: b.id,
    name: b.name,
    address: b.address,
    type: LOT_TYPE_FROM_BACKEND[b.lotType || ""] || "ground",
    status: LOT_STATUS_FROM_BACKEND[b.status || ""] || "operating",
    totalSpots: totalSpaces,
    availableSpots: availableSpaces,
    occupiedSpots,
    usageRate,
    entryCount: b.entryCount ?? 0,
    exitCount: b.exitCount ?? 0,
    laneCount: (b.entryCount ?? 0) + (b.exitCount ?? 0),
    createdAt: timestampToISO(b.createdAt),
    updatedAt: timestampToISO(b.updatedAt),
  };
}

export const parkingLotService = {
  async getSummary(): Promise<ParkingLotSummary> {
    const res = await apiClient.get<Record<string, unknown>>(
      "/parking/v1/lots/stats"
    );
    return {
      totalSpots: (res.totalSpaces ?? res.total_spaces ?? 0) as number,
      availableSpots: (res.availableSpaces ?? res.available_spaces ?? 0) as number,
      occupiedSpots: (res.occupiedVehicles ?? res.occupied_vehicles ?? 0) as number,
      laneCount: (res.totalGates ?? res.total_gates ?? 0) as number,
    };
  },

  async list(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: ParkingLotStatus;
    type?: ParkingLotType;
  }): Promise<PaginatedResponse<ParkingLot>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("page_size", String(params.pageSize));
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.status) {
      const statusMap: Record<string, string> = {
        operating: "PARKING_LOT_STATUS_ACTIVE",
        suspended: "PARKING_LOT_STATUS_INACTIVE",
      };
      query.set("status", statusMap[params.status] || params.status);
    }
    if (params?.type) {
      query.set("lot_type", LOT_TYPE_TO_BACKEND[params.type] || params.type);
    }
    const qs = query.toString();
    let res: Record<string, unknown>;
    try {
      res = (await apiClient.get<Record<string, unknown>>(
        `/parking/v1/lots${qs ? `?${qs}` : ""}`
      )) as Record<string, unknown>;
    } catch {
      return { data: [], total: 0, page: 1, pageSize: 20 };
    }
    if (!res || typeof res !== "object") {
      return { data: [], total: 0, page: 1, pageSize: 20 };
    }
    const rawLots = res.parkingLots ?? res.parking_lots ?? [];
    const parkingLots = (Array.isArray(rawLots) ? rawLots : []) as CamelParkingLot[];
    const pagination = (res.pagination ?? {}) as CamelPagination;

    return {
      data: parkingLots.filter(Boolean).map(mapParkingLot),
      total: pagination.total || 0,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 20,
    };
  },

  async create(data: CreateParkingLotRequest): Promise<ParkingLot> {
    const res = await apiClient.post<Record<string, unknown>>(
      "/parking/v1/lots",
      {
        name: data.name,
        address: data.address,
        totalSpaces: data.totalSpots,
        lotType: LOT_TYPE_TO_BACKEND[data.type || "ground"],
      }
    );
    return mapParkingLot((res.parkingLot ?? res.parking_lot) as CamelParkingLot);
  },

  async update(id: string, data: UpdateParkingLotRequest): Promise<ParkingLot> {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.address !== undefined) body.address = data.address;
    if (data.totalSpots !== undefined) body.totalSpaces = data.totalSpots;
    if (data.type !== undefined) body.lotType = LOT_TYPE_TO_BACKEND[data.type];

    const res = await apiClient.patch<Record<string, unknown>>(
      `/parking/v1/lots/${id}`,
      body
    );
    return mapParkingLot((res.parkingLot ?? res.parking_lot) as CamelParkingLot);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/parking/v1/lots/${id}`);
  },

  async getLaneConfig(parkingLotId: string): Promise<LaneConfigResponse> {
    const res = await apiClient.get<Record<string, unknown>>(
      `/parking/v1/lots/${parkingLotId}/lanes`
    );
    return mapLaneConfigResponse(res);
  },

  async updateLanes(
    parkingLotId: string,
    data: UpdateLanesRequest
  ): Promise<Lane[]> {
    const res = await apiClient.put<Record<string, unknown>>(
      `/parking/v1/lots/${parkingLotId}/lanes`,
      {
        parkingLotId,
        lanes: data.lanes.map((l) => ({
          laneId: l.id || "",
          name: l.name,
          laneType: l.type === "entry" ? "LANE_TYPE_ENTRY" : "LANE_TYPE_EXIT",
          deviceId: l.deviceId || "",
        })),
      }
    );
    const rawLanes = (res.lanes ?? []) as Record<string, unknown>[];
    return rawLanes.map(mapLane);
  },
};

const LANE_TYPE_FROM_BACKEND: Record<string, import("@/types").LaneType> = {
  LANE_TYPE_ENTRY: "entry",
  LANE_TYPE_EXIT: "exit",
};

function mapLaneConfigResponse(
  res: Record<string, unknown>
): LaneConfigResponse {
  const rawLanes = (Array.isArray(res.lanes) ? res.lanes : []) as Record<string, unknown>[];
  const rawDevicesVal = res.availableDevices ?? res.available_devices ?? [];
  const rawDevices = (Array.isArray(rawDevicesVal) ? rawDevicesVal : []) as Record<string, unknown>[];

  return {
    lanes: rawLanes.map(mapLane),
    availableDevices: rawDevices.map(
      (d: Record<string, unknown>): DeviceOption => ({
        id: (d.deviceId ?? d.device_id ?? "") as string,
        name: (d.name ?? "") as string,
        status: (d.status ?? "offline") as DeviceOnlineStatus,
      })
    ),
  };
}

function mapLane(b: Record<string, unknown>): Lane {
  const rawDevice = b.device as Record<string, unknown> | undefined;

  return {
    id: (b.laneId ?? b.lane_id ?? "") as string,
    parkingLotId: (b.parkingLotId ?? b.parking_lot_id ?? "") as string,
    name: (b.name ?? "") as string,
    type: LANE_TYPE_FROM_BACKEND[(b.laneType ?? b.lane_type ?? "") as string] ?? "entry",
    device: rawDevice
      ? {
          id: (rawDevice.deviceId ?? rawDevice.device_id ?? "") as string,
          name: (rawDevice.name ?? "") as string,
          status: (rawDevice.status ?? "offline") as DeviceOnlineStatus,
          lastHeartbeat: rawDevice.lastHeartbeat
            ? String(rawDevice.lastHeartbeat)
            : undefined,
        }
      : undefined,
  };
}
