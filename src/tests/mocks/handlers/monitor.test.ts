import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("monitor MSW handlers", () => {
  it("GET /api/monitor/realtime returns realtime data", async () => {
    const { monitorHandlers } = await import("@/mocks/handlers/monitor");
    server.use(...monitorHandlers);

    const res = await fetch("/api/monitor/realtime");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.kpi).toBeDefined();
    expect(json.data.events).toBeDefined();
    expect(json.data.occupancies).toBeDefined();
    expect(json.data.longParkAlerts).toBeDefined();
  });

  it("GET /api/monitor/realtime kpi has required fields", async () => {
    const { monitorHandlers } = await import("@/mocks/handlers/monitor");
    server.use(...monitorHandlers);

    const res = await fetch("/api/monitor/realtime");
    const json = await res.json();
    const kpi = json.data.kpi;
    expect(typeof kpi.todayEntries).toBe("number");
    expect(typeof kpi.todayExits).toBe("number");
    expect(typeof kpi.currentVehicles).toBe("number");
    expect(typeof kpi.todayRevenue).toBe("number");
  });

  it("GET /api/monitor/events returns events array", async () => {
    const { monitorHandlers } = await import("@/mocks/handlers/monitor");
    server.use(...monitorHandlers);

    const res = await fetch("/api/monitor/events");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0].plateNumber).toBeDefined();
      expect(json.data[0].time).toBeDefined();
    }
  });
});
