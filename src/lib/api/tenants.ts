import { apiClient } from "./client";
import type {
  Tenant,
  TenantStatus,
  TenantSummary,
  TenantFilters,
  CreateTenantRequest,
  UpdateTenantRequest,
  ParkingLot,
  PaginatedResponse,
} from "@/types";

interface BackendTenant {
  tenantId: string;
  name: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  planType?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  creditCode?: string;
  remark?: string;
  parkingLotCount?: number;
}

function mapStatus(s: string): TenantStatus {
  return s === "TENANT_STATUS_FROZEN" ? "frozen" : "active";
}

function statusToBackendFilter(s: TenantStatus): string {
  return s === "frozen" ? "TENANT_STATUS_FROZEN" : "TENANT_STATUS_ACTIVE";
}

export function mapBackendTenant(b: BackendTenant): Tenant {
  return {
    id: b.tenantId,
    companyName: b.name,
    description: b.description || undefined,
    creditCode: b.creditCode || undefined,
    contactPerson: b.contactName ?? "",
    contactPhone: b.contactPhone ?? "",
    adminEmail: b.contactEmail || undefined,
    remark: b.remark || undefined,
    parkingLotCount: b.parkingLotCount ?? 0,
    status: mapStatus(b.status),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function toBackendCreate(req: CreateTenantRequest): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: req.companyName,
    contactName: req.contactPerson,
    contactPhone: req.contactPhone,
  };
  if (req.adminEmail) out.contactEmail = req.adminEmail;
  if (req.description) out.description = req.description;
  if (req.creditCode) out.creditCode = req.creditCode;
  if (req.remark) out.remark = req.remark;
  return out;
}

function toBackendUpdate(req: UpdateTenantRequest): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (req.companyName !== undefined) out.name = req.companyName;
  if (req.contactPerson !== undefined) out.contactName = req.contactPerson;
  if (req.contactPhone !== undefined) out.contactPhone = req.contactPhone;
  if (req.adminEmail !== undefined) out.contactEmail = req.adminEmail;
  if (req.description !== undefined) out.description = req.description;
  if (req.creditCode !== undefined) out.creditCode = req.creditCode;
  if (req.remark !== undefined) out.remark = req.remark;
  return out;
}

interface ListResponse {
  tenants?: BackendTenant[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface TenantEnvelope {
  tenant: BackendTenant;
}

export const tenantService = {
  async list(filters?: TenantFilters): Promise<PaginatedResponse<Tenant>> {
    const query = new URLSearchParams();
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    // grpc-transcode 要求嵌套字段用点号表示
    query.set("pagination.page", String(page));
    query.set("pagination.page_size", String(pageSize));
    if (filters?.keyword) query.set("keyword", filters.keyword);
    if (filters?.status) query.set("status", statusToBackendFilter(filters.status));
    const raw = await apiClient.get<ListResponse>(
      `/api/v1/tenants?${query.toString()}`
    );
    const tenantList = Array.isArray(raw.tenants) ? raw.tenants : [];
    return {
      data: tenantList.map(mapBackendTenant),
      total: raw.pagination?.total ?? 0,
      page: raw.pagination?.page ?? page,
      pageSize: raw.pagination?.pageSize ?? pageSize,
    };
  },

  async get(id: string): Promise<Tenant> {
    const raw = await apiClient.get<TenantEnvelope>(`/api/v1/tenants/${id}`);
    return mapBackendTenant(raw.tenant);
  },

  async create(data: CreateTenantRequest): Promise<Tenant> {
    const raw = await apiClient.post<TenantEnvelope>(
      "/api/v1/tenants",
      toBackendCreate(data)
    );
    return mapBackendTenant(raw.tenant);
  },

  async update(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    const raw = await apiClient.put<TenantEnvelope>(
      `/api/v1/tenants/${id}`,
      toBackendUpdate(data)
    );
    return mapBackendTenant(raw.tenant);
  },

  async freeze(id: string): Promise<Tenant> {
    const raw = await apiClient.post<TenantEnvelope>(
      `/api/v1/tenants/${id}/freeze`
    );
    return mapBackendTenant(raw.tenant);
  },

  async unfreeze(id: string): Promise<Tenant> {
    const raw = await apiClient.post<TenantEnvelope>(
      `/api/v1/tenants/${id}/unfreeze`
    );
    return mapBackendTenant(raw.tenant);
  },

  // 后端 issue #20 尚未实现，前端继续走 MSW mock 兜底
  getSummary(): Promise<TenantSummary> {
    return apiClient.get("/api/v1/tenants/summary");
  },

  async getParkingLots(id: string): Promise<ParkingLot[]> {
    const raw = await apiClient.get<{ parkingLots?: ParkingLot[] }>(
      `/api/v1/tenants/${id}/parking-lots`
    );
    return raw.parkingLots ?? [];
  },
};
