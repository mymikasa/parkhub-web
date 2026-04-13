import { apiClient } from "./client";
import type {
  Tenant,
  TenantSummary,
  TenantFilters,
  CreateTenantRequest,
  UpdateTenantRequest,
  ParkingLot,
  PaginatedResponse,
} from "@/types";

export const tenantService = {
  getSummary(): Promise<TenantSummary> {
    return apiClient.get("/api/tenants/summary");
  },

  list(filters?: TenantFilters): Promise<PaginatedResponse<Tenant>> {
    const query = new URLSearchParams();
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.pageSize) query.set("pageSize", String(filters.pageSize));
    if (filters?.keyword) query.set("keyword", filters.keyword);
    if (filters?.status) query.set("status", filters.status);
    const qs = query.toString();
    return apiClient.get(`/api/tenants${qs ? `?${qs}` : ""}`);
  },

  create(data: CreateTenantRequest): Promise<Tenant> {
    return apiClient.post("/api/tenants", data);
  },

  update(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    return apiClient.patch(`/api/tenants/${id}`, data);
  },

  freeze(id: string): Promise<Tenant> {
    return apiClient.post(`/api/tenants/${id}/freeze`);
  },

  unfreeze(id: string): Promise<Tenant> {
    return apiClient.post(`/api/tenants/${id}/unfreeze`);
  },

  getParkingLots(id: string): Promise<ParkingLot[]> {
    return apiClient.get(`/api/tenants/${id}/parking-lots`);
  },
};
