import { apiClient } from "./client";
import type {
  Device,
  DeviceStats,
  DeviceFilters,
  CreateDeviceRequest,
  UpdateDeviceNameRequest,
  BindDeviceRequest,
  BatchIdsRequest,
  BatchBindRequest,
  BatchAffectedResponse,
  DeviceCommandRequest,
  DeviceCommandResponse,
  DeviceType,
  PaginatedResponse,
} from "@/types";

const DEVICE_TYPE_TO_BACKEND: Record<DeviceType, string> = {
  integrated: "DEVICE_TYPE_INTEGRATED",
  camera_only: "DEVICE_TYPE_CAMERA_ONLY",
  barrier_only: "DEVICE_TYPE_BARRIER_ONLY",
};

const DEVICE_TYPE_FROM_BACKEND: Record<string, DeviceType> = {
  DEVICE_TYPE_INTEGRATED: "integrated",
  DEVICE_TYPE_CAMERA_ONLY: "camera_only",
  DEVICE_TYPE_BARRIER_ONLY: "barrier_only",
};

const DEVICE_STATUS_FROM_BACKEND: Record<string, string> = {
  DEVICE_STATUS_PENDING: "pending",
  DEVICE_STATUS_ACTIVE: "active",
  DEVICE_STATUS_OFFLINE: "offline",
  DEVICE_STATUS_DISABLED: "disabled",
};

const DEVICE_STATUS_TO_BACKEND: Record<string, string> = {
  pending: "DEVICE_STATUS_PENDING",
  active: "DEVICE_STATUS_ACTIVE",
  offline: "DEVICE_STATUS_OFFLINE",
  disabled: "DEVICE_STATUS_DISABLED",
};

interface CamelTimestamp {
  seconds?: string | number;
  nanos?: number;
}

interface BackendDevice {
  id: string;
  tenantId?: string;
  name?: string;
  type?: string;
  status?: string;
  firmwareVersion?: string;
  lastHeartbeat?: CamelTimestamp | string | null;
  parkingLotId?: string | null;
  gateId?: string | null;
  createdAt?: CamelTimestamp | string;
  updatedAt?: CamelTimestamp | string;
}

interface BackendPagination {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

function timestampToISO(ts?: CamelTimestamp | string | null): string | null {
  if (!ts) return null;
  if (typeof ts === "string") return ts;
  const ms = (Number(ts.seconds) || 0) * 1000 + Math.floor((ts.nanos || 0) / 1e6);
  return new Date(ms).toISOString();
}

function mapDevice(b: BackendDevice): Device {
  return {
    id: b.id,
    tenantId: b.tenantId || "",
    name: b.name || "",
    type: DEVICE_TYPE_FROM_BACKEND[b.type || ""] || "integrated",
    status: (DEVICE_STATUS_FROM_BACKEND[b.status || ""] || b.status || "pending") as Device["status"],
    firmwareVersion: b.firmwareVersion || "",
    lastHeartbeat: timestampToISO(b.lastHeartbeat),
    parkingLotId: b.parkingLotId ?? null,
    gateId: b.gateId ?? null,
    createdAt: timestampToISO(b.createdAt) || "",
    updatedAt: timestampToISO(b.updatedAt) || "",
  };
}

export const deviceService = {
  async list(filters?: DeviceFilters): Promise<PaginatedResponse<Device>> {
    const query = new URLSearchParams();
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.pageSize) query.set("page_size", String(filters.pageSize));
    if (filters?.status) query.set("status", DEVICE_STATUS_TO_BACKEND[filters.status] || filters.status);
    if (filters?.parkingLotId) query.set("parking_lot_id", filters.parkingLotId);
    if (filters?.keyword) query.set("keyword", filters.keyword);
    const qs = query.toString();
    const res = await apiClient.get<Record<string, unknown>>(`/iot/v1/devices${qs ? `?${qs}` : ""}`);
    const rawDevices = res.devices ?? [];
    const pagination = (res.pagination ?? {}) as BackendPagination;
    return {
      data: (Array.isArray(rawDevices) ? rawDevices : []).map((d: BackendDevice) => mapDevice(d)),
      total: pagination.total || 0,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 20,
    };
  },

  async getStats(): Promise<DeviceStats> {
    const res = await apiClient.get<Record<string, unknown>>("/iot/v1/devices/stats");
    return {
      total: (res.total ?? 0) as number,
      active: (res.active ?? 0) as number,
      offline: (res.offline ?? 0) as number,
      pending: (res.pending ?? 0) as number,
      disabled: (res.disabled ?? 0) as number,
    };
  },

  async get(id: string): Promise<Device> {
    const res = await apiClient.get<Record<string, unknown>>(`/iot/v1/devices/${id}`);
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async create(data: CreateDeviceRequest): Promise<Device> {
    const body: Record<string, unknown> = { id: data.id, type: DEVICE_TYPE_TO_BACKEND[data.type] };
    if (data.name) body.name = data.name;
    if (data.firmwareVersion) body.firmware_version = data.firmwareVersion;
    const res = await apiClient.post<Record<string, unknown>>("/iot/v1/devices", body);
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async updateName(id: string, data: UpdateDeviceNameRequest): Promise<Device> {
    const res = await apiClient.patch<Record<string, unknown>>(`/iot/v1/devices/${id}`, { name: data.name });
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/iot/v1/devices/${id}`);
  },

  async bind(id: string, data: BindDeviceRequest): Promise<Device> {
    const res = await apiClient.post<Record<string, unknown>>(`/iot/v1/devices/${id}/bind`, {
      parking_lot_id: data.parkingLotId,
      gate_id: data.gateId,
    });
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async unbind(id: string): Promise<Device> {
    const res = await apiClient.post<Record<string, unknown>>(`/iot/v1/devices/${id}/unbind`);
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async disable(id: string): Promise<Device> {
    const res = await apiClient.post<Record<string, unknown>>(`/iot/v1/devices/${id}/disable`);
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async enable(id: string): Promise<Device> {
    const res = await apiClient.post<Record<string, unknown>>(`/iot/v1/devices/${id}/enable`);
    return mapDevice((res.device ?? res) as BackendDevice);
  },

  async batchDisable(data: BatchIdsRequest): Promise<BatchAffectedResponse> {
    const res = await apiClient.post<Record<string, unknown>>("/iot/v1/devices/batch/disable", { ids: data.ids });
    return { affected: (res.affected ?? 0) as number };
  },

  async batchEnable(data: BatchIdsRequest): Promise<BatchAffectedResponse> {
    const res = await apiClient.post<Record<string, unknown>>("/iot/v1/devices/batch/enable", { ids: data.ids });
    return { affected: (res.affected ?? 0) as number };
  },

  async batchDelete(data: BatchIdsRequest): Promise<BatchAffectedResponse> {
    const res = await apiClient.post<Record<string, unknown>>("/iot/v1/devices/batch/delete", { ids: data.ids });
    return { affected: (res.affected ?? 0) as number };
  },

  async batchBind(data: BatchBindRequest): Promise<BatchAffectedResponse> {
    const bindings = data.bindings.map((b) => ({ id: b.id, parking_lot_id: b.parkingLotId, gate_id: b.gateId }));
    const res = await apiClient.post<Record<string, unknown>>("/iot/v1/devices/batch/bind", { bindings });
    return { affected: (res.affected ?? 0) as number };
  },

  async sendCommand(id: string, data: DeviceCommandRequest): Promise<DeviceCommandResponse> {
    const res = await apiClient.post<Record<string, unknown>>(`/iot/v1/devices/${id}/command`, { action: data.action });
    return { success: (res.success ?? false) as boolean, message: (res.message ?? "") as string };
  },
};
