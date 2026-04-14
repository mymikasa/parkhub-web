import { http, HttpResponse, delay } from "msw";
import {
  getOrderByPlate,
  getOrderById,
  simulatePayment,
  getPaymentStatusById,
} from "../data/payment";
import { getBillingRuleByParkingLotId } from "../data/billing";

function getLotIdByName(name: string): string {
  if (name.includes("翡翠滨江")) return "lot_001";
  if (name.includes("万科广场")) return "lot_002";
  if (name.includes("城市花园")) return "lot_003";
  if (name.includes("万科星城")) return "lot_005";
  if (name.includes("金域华府")) return "lot_006";
  return "lot_001";
}

function recomputeFee(order: {
  parkingLotName: string;
  entryTime: string;
  freeDuration: string;
  billableDuration: string;
  unitPrice: number;
  totalFee: number;
}) {
  const rule = getBillingRuleByParkingLotId(getLotIdByName(order.parkingLotName));
  if (!rule) return {};

  const totalMinutes = Math.max(0, Math.round((Date.now() - new Date(order.entryTime).getTime()) / 60000));
  const freeMinutes = Math.min(rule.freeDurationMinutes, totalMinutes);
  const billableMinutes = Math.max(0, totalMinutes - freeMinutes);
  const roundedHours = billableMinutes > 0 ? Math.ceil(billableMinutes / 60) : 0;

  let totalFee = roundedHours * rule.unitPrice;
  if (rule.dailyCap !== null) totalFee = Math.min(totalFee, rule.dailyCap);
  totalFee = Math.round(totalFee * 100) / 100;

  const billableH = Math.floor(billableMinutes / 60);
  const billableM = billableMinutes % 60;

  return {
    freeDuration: `${freeMinutes}分钟`,
    billableDuration: `${billableH}小时${billableM}分钟 → ${roundedHours}小时`,
    unitPrice: rule.unitPrice,
    totalFee,
  };
}

function recomputeDuration(entryTime: string): string {
  const totalMinutes = Math.max(0, Math.round((Date.now() - new Date(entryTime).getTime()) / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}小时${String(m).padStart(2, "0")}分钟`;
}

export const paymentHandlers = [
  http.get("/api/payment/orders/:plateNumber", async ({ params }) => {
    await delay(300);
    const plateNumber = decodeURIComponent(params.plateNumber as string);
    const order = getOrderByPlate(plateNumber);

    if (!order) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "未找到该车牌的缴费订单" },
        { status: 404 }
      );
    }

    const fee = recomputeFee(order);
    const duration = recomputeDuration(order.entryTime);

    return HttpResponse.json({
      data: {
        ...order,
        currentTime: new Date().toISOString(),
        duration,
        ...fee,
      },
    });
  }),

  http.post("/api/payment/pay", async ({ request }) => {
    await delay(2000);
    const body = (await request.json()) as { orderId: string; method: "wechat" | "alipay" };

    if (!body.orderId || !body.method) {
      return HttpResponse.json(
        { code: "INVALID_PARAM", message: "缺少订单号或支付方式" },
        { status: 400 }
      );
    }

    const order = getOrderById(body.orderId);
    if (!order) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "订单不存在" },
        { status: 404 }
      );
    }

    if (order.status !== "pending") {
      return HttpResponse.json(
        { code: "ORDER_ALREADY_PAID", message: "订单已支付" },
        { status: 400 }
      );
    }

    try {
      const result = simulatePayment(body.orderId, body.method);
      return HttpResponse.json({ data: result });
    } catch (e) {
      const err = e as Error;
      if (err.message === "ORDER_NOT_FOUND") {
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "订单不存在" },
          { status: 404 }
        );
      }
      if (err.message === "ORDER_ALREADY_PAID") {
        return HttpResponse.json(
          { code: "ORDER_ALREADY_PAID", message: "订单已支付" },
          { status: 400 }
        );
      }
      return HttpResponse.json(
        { code: "PAYMENT_FAILED", message: "支付失败" },
        { status: 500 }
      );
    }
  }),

  http.get("/api/payment/pay/:id/status", async ({ params }) => {
    await delay(200);
    const orderId = params.id as string;
    const status = getPaymentStatusById(orderId);

    if (!status) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "订单不存在" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: status });
  }),
];
