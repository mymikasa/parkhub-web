import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/lib/api/tenants";
import type { TenantFilters, CreateTenantRequest, UpdateTenantRequest } from "@/types";

export const tenantKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: (filters?: TenantFilters) => [...tenantKeys.lists(), filters] as const,
  summary: () => [...tenantKeys.all, "summary"] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
  parkingLots: (id: string) => [...tenantKeys.all, id, "parking-lots"] as const,
};

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: () => tenantService.list(filters),
  });
}

export function useTenantSummary() {
  return useQuery({
    queryKey: tenantKeys.summary(),
    queryFn: () => tenantService.getSummary(),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantService.get(id),
    enabled: !!id,
  });
}

export function useTenantParkingLots(id: string) {
  return useQuery({
    queryKey: tenantKeys.parkingLots(id),
    queryFn: () => tenantService.getParkingLots(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      tenantService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useFreezeTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantService.freeze(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useUnfreezeTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantService.unfreeze(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
