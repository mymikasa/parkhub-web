import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("billing MSW handlers", () => {
  it("GET /api/billing-rules returns rules list", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules");
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("GET /api/billing-rules filters by parkingLotId", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules?parkingLotId=lot_001");
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    json.data.forEach((r: { parkingLotId: string }) => {
      expect(r.parkingLotId).toBe("lot_001");
    });
  });

  it("PUT /api/billing-rules/:id updates rule", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/bill_001", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPrice: 10 }),
    });
    const json = await res.json();
    expect(json.data.unitPrice).toBe(10);
  });

  it("PUT /api/billing-rules/:id returns 404 for non-existent", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/nonexistent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitPrice: 10 }),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/billing-rules/calculate returns fee result", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parkingLotId: "lot_001",
        entryTime: "2026-03-13T09:30:00Z",
        exitTime: "2026-03-13T14:30:00Z",
      }),
    });
    const json = await res.json();
    expect(json.data.duration).toBeDefined();
    expect(json.data.totalFee).toBeGreaterThan(0);
    expect(typeof json.data.totalFee).toBe("number");
  });

  it("POST /api/billing-rules/calculate returns 404 for lot without rule", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parkingLotId: "lot_004",
        entryTime: "2026-03-13T09:30:00Z",
        exitTime: "2026-03-13T14:30:00Z",
      }),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/billing-rules/calculate returns 400 with missing params", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parkingLotId: "lot_001" }),
    });
    expect(res.status).toBe(400);
  });

  it("free parking within free duration", async () => {
    const { billingHandlers } = await import("@/mocks/handlers/billing");
    server.use(...billingHandlers);

    const res = await fetch("/api/billing-rules/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parkingLotId: "lot_001",
        entryTime: "2026-03-13T09:00:00Z",
        exitTime: "2026-03-13T09:10:00Z",
      }),
    });
    const json = await res.json();
    expect(json.data.totalFee).toBe(0);
  });
});
