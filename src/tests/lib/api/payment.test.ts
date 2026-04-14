import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { paymentService } from "@/lib/api/payment";

const mockOrder = {
  id: "pay_001",
  plateNumber: "沪A·88888",
  parkingLotName: "万科翡翠滨江地下停车场",
  entryLane: "1号入口入场",
  vehicleImage: "https://example.com/car.jpg",
  vehicleType: "临时车",
  entryTime: "2026-03-13T09:30:00Z",
  currentTime: "2026-03-13T14:32:00Z",
  duration: "5小时02分钟",
  freeDuration: "15分钟",
  billableDuration: "4小时47分钟 → 5小时",
  unitPrice: 8,
  totalFee: 40,
  status: "pending",
};

const mockPaymentResult = {
  orderId: "pay_001",
  plateNumber: "沪A·88888",
  amount: 40,
  method: "wechat",
  paidAt: "2026-03-13T14:32:00Z",
  departureDeadline: "2026-03-13T14:47:00Z",
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("paymentService", () => {
  it("getOrder calls GET /api/payment/orders/:plateNumber", async () => {
    server.use(
      http.get("/api/payment/orders/:plateNumber", ({ params }) => {
        const plate = decodeURIComponent(params.plateNumber as string);
        expect(plate).toBe("沪A·88888");
        return HttpResponse.json({ data: mockOrder });
      })
    );

    const result = await paymentService.getOrder("沪A·88888");
    expect(result.plateNumber).toBe("沪A·88888");
    expect(result.id).toBe("pay_001");
  });

  it("getOrder throws on 404", async () => {
    server.use(
      http.get("/api/payment/orders/:plateNumber", () => {
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "未找到该车牌的缴费订单" },
          { status: 404 }
        );
      })
    );

    await expect(paymentService.getOrder("不存在")).rejects.toThrow();
  });

  it("pay calls POST /api/payment/pay", async () => {
    server.use(
      http.post("/api/payment/pay", async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        expect(body).toEqual({ orderId: "pay_001", method: "wechat" });
        return HttpResponse.json({ data: mockPaymentResult });
      })
    );

    const result = await paymentService.pay({ orderId: "pay_001", method: "wechat" });
    expect(result.amount).toBe(40);
    expect(result.method).toBe("wechat");
  });

  it("pay with alipay method", async () => {
    server.use(
      http.post("/api/payment/pay", () => {
        return HttpResponse.json({
          data: { ...mockPaymentResult, method: "alipay" },
        });
      })
    );

    const result = await paymentService.pay({ orderId: "pay_001", method: "alipay" });
    expect(result.method).toBe("alipay");
  });

  it("getStatus calls GET /api/payment/pay/:id/status", async () => {
    server.use(
      http.get("/api/payment/pay/pay_001/status", () => {
        return HttpResponse.json({
          data: {
            orderId: "pay_001",
            status: "pending",
          },
        });
      })
    );

    const result = await paymentService.getStatus("pay_001");
    expect(result.orderId).toBe("pay_001");
    expect(result.status).toBe("pending");
  });

  it("getStatus for paid order", async () => {
    server.use(
      http.get("/api/payment/pay/pay_001/status", () => {
        return HttpResponse.json({
          data: {
            orderId: "pay_001",
            status: "paid",
            paidAt: "2026-03-13T14:32:00Z",
            departureDeadline: "2026-03-13T14:47:00Z",
          },
        });
      })
    );

    const result = await paymentService.getStatus("pay_001");
    expect(result.status).toBe("paid");
    expect(result.paidAt).toBeDefined();
    expect(result.departureDeadline).toBeDefined();
  });
});
