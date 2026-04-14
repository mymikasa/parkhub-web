import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("payment MSW handlers", () => {
  it("GET /api/payment/orders/:plateNumber returns order", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/orders/沪A·88888");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.plateNumber).toBe("沪A·88888");
    expect(json.data.id).toBe("pay_001");
    expect(json.data.totalFee).toBeGreaterThan(0);
  });

  it("GET /api/payment/orders/:plateNumber returns 404 for unknown plate", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/orders/不存在");
    expect(res.status).toBe(404);
  });

  it("POST /api/payment/pay processes wechat payment", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "pay_003", method: "wechat" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.amount).toBeGreaterThan(0);
    expect(json.data.method).toBe("wechat");
    expect(json.data.departureDeadline).toBeDefined();
  });

  it("POST /api/payment/pay returns 404 for non-existent order", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "nonexistent", method: "wechat" }),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/payment/pay returns 400 with missing params", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "pay_001" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/payment/pay returns 400 for already paid order", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    await fetch("/api/payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "pay_001", method: "wechat" }),
    });

    const res = await fetch("/api/payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "pay_001", method: "wechat" }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/payment/pay/:id/status returns 404 for non-existent", async () => {
    const { paymentHandlers } = await import("@/mocks/handlers/payment");
    server.use(...paymentHandlers);

    const res = await fetch("/api/payment/pay/nonexistent/status");
    expect(res.status).toBe(404);
  });
});
