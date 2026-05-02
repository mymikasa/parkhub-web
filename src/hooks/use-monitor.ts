import { useQuery } from "@tanstack/react-query";
import { monitorService } from "@/lib/api/monitor";

export const monitorKeys = {
  realtime: () => ["monitor", "realtime"] as const,
  events: () => ["monitor", "events"] as const,
};

export function useMonitorRealtime() {
  return useQuery({
    queryKey: monitorKeys.realtime(),
    queryFn: () => monitorService.getRealtime(),
    refetchInterval: 10000,
  });
}

export function useMonitorEvents() {
  return useQuery({
    queryKey: monitorKeys.events(),
    queryFn: () => monitorService.getEvents(),
    refetchInterval: 10000,
  });
}
