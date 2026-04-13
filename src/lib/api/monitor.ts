import { apiClient } from "./client";
import type { MonitorRealtimeData, MonitorEvent } from "@/types";

export const monitorService = {
  getRealtime(): Promise<MonitorRealtimeData> {
    return apiClient.get("/api/monitor/realtime");
  },

  getEvents(): Promise<MonitorEvent[]> {
    return apiClient.get("/api/monitor/events");
  },
};
