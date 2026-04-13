import { apiClient } from "./client";
import type {
  EntryExitRecord,
  RecordSummary,
  RecordFilters,
  ExceptionHandleRequest,
  PaginatedResponse,
} from "@/types";

export const recordService = {
  list(filters?: RecordFilters): Promise<PaginatedResponse<EntryExitRecord>> {
    const query = new URLSearchParams();
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.pageSize) query.set("pageSize", String(filters.pageSize));
    if (filters?.dateFrom) query.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) query.set("dateTo", filters.dateTo);
    if (filters?.plateNumber) query.set("plateNumber", filters.plateNumber);
    if (filters?.parkingLotId) query.set("parkingLotId", filters.parkingLotId);
    if (filters?.type) query.set("type", filters.type);
    if (filters?.status) query.set("status", filters.status);
    const qs = query.toString();
    return apiClient.get(`/api/records${qs ? `?${qs}` : ""}`);
  },

  getSummary(): Promise<RecordSummary> {
    return apiClient.get("/api/records/summary");
  },

  getById(id: string): Promise<EntryExitRecord> {
    return apiClient.get(`/api/records/${id}`);
  },

  handleException(id: string, data: ExceptionHandleRequest): Promise<EntryExitRecord> {
    return apiClient.patch(`/api/records/${id}/exception`, data);
  },

  async export(filters?: RecordFilters): Promise<void> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) query.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) query.set("dateTo", filters.dateTo);
    if (filters?.plateNumber) query.set("plateNumber", filters.plateNumber);
    if (filters?.parkingLotId) query.set("parkingLotId", filters.parkingLotId);
    if (filters?.type) query.set("type", filters.type);
    if (filters?.status) query.set("status", filters.status);
    const qs = query.toString();

    const response = await fetch(`/api/records/export${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });

    if (!response.ok) throw new Error("导出失败");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `出入记录_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
