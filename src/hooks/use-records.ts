import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordService } from "@/lib/api/records";
import type { RecordFilters, RecordSummary, ExceptionHandleRequest } from "@/types";

export const recordKeys = {
  all: ["records"] as const,
  lists: () => [...recordKeys.all, "list"] as const,
  list: (filters?: RecordFilters) => [...recordKeys.lists(), filters] as const,
  summary: () => [...recordKeys.all, "summary"] as const,
  detail: (id: string) => [...recordKeys.all, "detail", id] as const,
};

export function useRecords(filters?: RecordFilters) {
  return useQuery({
    queryKey: recordKeys.list(filters),
    queryFn: () => recordService.list(filters),
  });
}

export function useRecordSummary() {
  return useQuery({
    queryKey: recordKeys.summary(),
    queryFn: () => recordService.getSummary(),
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: () => recordService.getById(id),
    enabled: !!id,
  });
}

export function useHandleException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExceptionHandleRequest }) =>
      recordService.handleException(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}

export function useExportRecords() {
  return useMutation({
    mutationFn: (filters?: RecordFilters) => recordService.export(filters),
  });
}
