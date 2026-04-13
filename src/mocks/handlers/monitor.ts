import { http, HttpResponse, delay } from "msw";
import { getMonitorRealtimeData, getMonitorEvents } from "../data/monitor";

export const monitorHandlers = [
  http.get("/api/monitor/realtime", async () => {
    await delay(300);
    return HttpResponse.json({ data: getMonitorRealtimeData() });
  }),

  http.get("/api/monitor/events", async () => {
    await delay(200);
    return HttpResponse.json({ data: getMonitorEvents() });
  }),
];
