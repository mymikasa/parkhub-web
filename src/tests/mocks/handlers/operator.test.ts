import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("operator MSW handlers", () => {
  it("GET /api/operator/events returns events array", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/events");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("GET /api/operator/exceptions returns exceptions array", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/exceptions");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("POST /api/operator/actions/lift-barrier returns success", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/actions/lift-barrier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parkingLotId: "lot_001", laneId: "lane_001", reason: "test" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.success).toBe(true);
  });

  it("POST /api/operator/actions/manual-charge returns success", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/actions/manual-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plateNumber: "沪A·88888", amount: 20, paymentMethod: "cash" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.success).toBe(true);
    expect(json.data.message).toContain("沪A·88888");
  });

  it("POST /api/operator/actions/correct-plate returns success", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/actions/correct-plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plateNumber: "沪B·99999" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.success).toBe(true);
    expect(json.data.message).toContain("沪B·99999");
  });

  it("GET /api/operator/vehicles/search returns result for known plate", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/vehicles/search?plateNumber=沪A·88888");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).not.toBeNull();
    expect(json.data.plateNumber).toBeDefined();
  });

  it("GET /api/operator/vehicles/search returns null for unknown plate", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/vehicles/search?plateNumber=未知");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeNull();
  });

  it("GET /api/operator/vehicles/search returns null without plateNumber", async () => {
    const { operatorHandlers } = await import("@/mocks/handlers/operator");
    server.use(...operatorHandlers);

    const res = await fetch("/api/operator/vehicles/search");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeNull();
  });
});
