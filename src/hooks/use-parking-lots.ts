import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { ParkingLotStatus, ParkingLotType } from "@/types";

export const parkingLotKeys = {
  all: ["parking-lots"] as const,
  lists: () => [...parkingLotKeys.all, "list"] as const,
  list: (params?: { page?: number; pageSize?: number; keyword?: string; status?: ParkingLotStatus; type?: ParkingLotType }) =>
    [...parkingLotKeys.lists(), params] as const,
  summary: () => [...parkingLotKeys.all, "summary"] as const,
  detail: (id: string) => [...parkingLotKeys.all, "detail", id] as const,
  lanes: (id: string) => [...parkingLotKeys.all, id, "lanes"] as const,
};

export function useParkingLots(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ParkingLotStatus;
  type?: ParkingLotType;
}) {
  return useQuery({
    queryKey: parkingLotKeys.list(params),
    queryFn: () => parkingLotService.list(params),
  });
}

export function useParkingLotSummary() {
  return useQuery({
    queryKey: parkingLotKeys.summary(),
    queryFn: () => parkingLotService.getSummary(),
  });
}

export function useCreateParkingLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof parkingLotService.create>[0]) => parkingLotService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parkingLotKeys.all });
    },
  });
}

export function useUpdateParkingLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof parkingLotService.update>[1] }) =>
      parkingLotService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parkingLotKeys.all });
    },
  });
}

export function useDeleteParkingLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parkingLotService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parkingLotKeys.all });
    },
  });
}
