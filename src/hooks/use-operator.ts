import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operatorService } from "@/lib/api/operator";
import type { LiftBarrierRequest, ManualChargeRequest, CorrectPlateRequest } from "@/types";

export const operatorKeys = {
  all: ["operator"] as const,
  events: () => [...operatorKeys.all, "events"] as const,
  exceptions: () => [...operatorKeys.all, "exceptions"] as const,
};

export function useOperatorEvents() {
  return useQuery({
    queryKey: operatorKeys.events(),
    queryFn: () => operatorService.getEvents(),
    refetchInterval: 10000,
  });
}

export function useOperatorExceptions() {
  return useQuery({
    queryKey: operatorKeys.exceptions(),
    queryFn: () => operatorService.getExceptions(),
    refetchInterval: 10000,
  });
}

export function useLiftBarrier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LiftBarrierRequest) => operatorService.liftBarrier(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operatorKeys.all });
    },
  });
}

export function useManualCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualChargeRequest) => operatorService.manualCharge(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operatorKeys.all });
    },
  });
}

export function useCorrectPlate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CorrectPlateRequest) => operatorService.correctPlate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operatorKeys.all });
    },
  });
}

export function useSearchVehicle() {
  return useMutation({
    mutationFn: (plateNumber: string) => operatorService.searchVehicle(plateNumber),
  });
}
