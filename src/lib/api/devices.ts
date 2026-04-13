import { apiClient } from "./client";
import type {
  Device,
  DeviceSummary,
  DeviceFilters,
  RegisterDeviceRequest,
  DeviceCommandRequest,
  PaginatedResponse,
} from "@/types";

export const deviceService = {
  getSummary(): Promise<DeviceSummary> {
    return apiClient.get("/api/devices/summary");
  },

  list(filters?: DeviceFilters): Promise<PaginatedResponse<Device>> {
    const query = new URLSearchParams();
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.pageSize) query.set("pageSize", String(filters.pageSize));
    if (filters?.status) query.set("status", filters.status);
    if (filters?.parkingLotId) query.set("parkingLotId", filters.parkingLotId);
    if (filters?.keyword) query.set("keyword", filters.keyword);
    const qs = query.toString();
    return apiClient.get(`/api/devices${qs ? `?${qs}` : ""}`);
  },

  register(data: RegisterDeviceRequest): Promise<Device> {
    return apiClient.post("/api/devices", data);
  },

  sendCommand(id: string, data: DeviceCommandRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/devices/${id}/command`, data);
  },
};
