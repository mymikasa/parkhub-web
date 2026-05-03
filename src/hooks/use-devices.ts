import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceService } from "@/lib/api/devices";
import type { DeviceFilters, CreateDeviceRequest, UpdateDeviceNameRequest, BindDeviceRequest, BatchIdsRequest, BatchBindRequest, DeviceCommandRequest } from "@/types";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (filters?: DeviceFilters) => [...deviceKeys.lists(), filters] as const,
  stats: () => [...deviceKeys.all, "stats"] as const,
  detail: (id: string) => [...deviceKeys.all, "detail", id] as const,
};

export function useDevices(filters?: DeviceFilters) {
  return useQuery({
    queryKey: deviceKeys.list(filters),
    queryFn: () => deviceService.list(filters),
  });
}

export function useDeviceStats() {
  return useQuery({
    queryKey: deviceKeys.stats(),
    queryFn: () => deviceService.getStats(),
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => deviceService.get(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeviceRequest) => deviceService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useUpdateDeviceName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceNameRequest }) =>
      deviceService.updateName(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useDeleteDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useBindDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BindDeviceRequest }) =>
      deviceService.bind(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useUnbindDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceService.unbind(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useDisableDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceService.disable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useEnableDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceService.enable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useBatchDisableDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchIdsRequest) => deviceService.batchDisable(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useBatchEnableDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchIdsRequest) => deviceService.batchEnable(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useBatchDeleteDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchIdsRequest) => deviceService.batchDelete(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useBatchBindDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchBindRequest) => deviceService.batchBind(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useSendDeviceCommand() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeviceCommandRequest }) =>
      deviceService.sendCommand(id, data),
  });
}
