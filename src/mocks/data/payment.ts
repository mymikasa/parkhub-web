import type { PaymentOrder, PaymentResult, PaymentStatus, PaymentStatusResponse } from "@/types";
import { getBillingRuleByParkingLotId } from "./billing";

const ENTRY_TIME = new Date();
ENTRY_TIME.setHours(ENTRY_TIME.getHours() - 5);
ENTRY_TIME.setMinutes(ENTRY_TIME.getMinutes() - 2);

function makeCurrentTime(): string {
  return new Date().toISOString();
}

function formatDuration(entryISO: string, currentISO: string): string {
  const diffMs = new Date(currentISO).getTime() - new Date(entryISO).getTime();
  const totalMin = Math.max(0, Math.round(diffMs / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}小时${String(m).padStart(2, "0")}分钟`;
}

function computeFee(parkingLotId: string, entryISO: string, currentISO: string) {
  const rule = getBillingRuleByParkingLotId(parkingLotId);
  if (!rule) {
    return { freeDuration: "0分钟", billableDuration: "0小时", unitPrice: 8, totalFee: 0 };
  }

  const entry = new Date(entryISO);
  const exit = new Date(currentISO);
  const totalMinutes = Math.max(0, Math.round((exit.getTime() - entry.getTime()) / 60000));

  const freeMinutes = Math.min(rule.freeDurationMinutes, totalMinutes);
  const billableMinutes = Math.max(0, totalMinutes - freeMinutes);
  const roundedHours = billableMinutes > 0 ? Math.ceil(billableMinutes / 60) : 0;

  const billableH = Math.floor(billableMinutes / 60);
  const billableM = billableMinutes % 60;
  const billableDuration = `${billableH}小时${billableM}分钟 → ${roundedHours}小时`;

  let totalFee = roundedHours * rule.unitPrice;
  if (rule.dailyCap !== null) {
    totalFee = Math.min(totalFee, rule.dailyCap);
  }
  totalFee = Math.round(totalFee * 100) / 100;

  return {
    freeDuration: `${freeMinutes}分钟`,
    billableDuration,
    unitPrice: rule.unitPrice,
    totalFee,
  };
}

export const mockPaymentOrders: PaymentOrder[] = [
  (() => {
    const entryTime = ENTRY_TIME.toISOString();
    const currentTime = makeCurrentTime();
    const fee = computeFee("lot_001", entryTime, currentTime);
    return {
      id: "pay_001",
      plateNumber: "沪A·88888",
      parkingLotName: "万科翡翠滨江地下停车场",
      entryLane: "1号入口入场",
      vehicleImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=140&fit=crop",
      vehicleType: "临时车",
      entryTime,
      currentTime,
      duration: formatDuration(entryTime, currentTime),
      ...fee,
      status: "pending" as PaymentStatus,
    };
  })(),
  (() => {
    const entryTime = new Date();
    entryTime.setHours(entryTime.getHours() - 2);
    const currentTime = makeCurrentTime();
    const fee = computeFee("lot_002", entryTime.toISOString(), currentTime);
    return {
      id: "pay_002",
      plateNumber: "京B·66666",
      parkingLotName: "万科广场商业停车场",
      entryLane: "2号入口入场",
      vehicleImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=140&fit=crop",
      vehicleType: "临时车",
      entryTime: entryTime.toISOString(),
      currentTime,
      duration: formatDuration(entryTime.toISOString(), currentTime),
      ...fee,
      status: "pending" as PaymentStatus,
    };
  })(),
  (() => {
    const entryTime = new Date();
    entryTime.setHours(entryTime.getHours() - 1);
    entryTime.setMinutes(entryTime.getMinutes() - 30);
    const currentTime = makeCurrentTime();
    const fee = computeFee("lot_003", entryTime.toISOString(), currentTime);
    return {
      id: "pay_003",
      plateNumber: "粤C·12345",
      parkingLotName: "万科城市花园停车场",
      entryLane: "1号入口入场",
      vehicleImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=140&fit=crop",
      vehicleType: "临时车",
      entryTime: entryTime.toISOString(),
      currentTime,
      duration: formatDuration(entryTime.toISOString(), currentTime),
      ...fee,
      status: "pending" as PaymentStatus,
    };
  })(),
];

export function getOrderByPlate(plateNumber: string): PaymentOrder | undefined {
  return mockPaymentOrders.find((o) => o.plateNumber === plateNumber);
}

export function getOrderById(id: string): PaymentOrder | undefined {
  return mockPaymentOrders.find((o) => o.id === id);
}

export function updateOrderStatus(id: string, status: PaymentStatus): void {
  const order = mockPaymentOrders.find((o) => o.id === id);
  if (order) order.status = status;
}

export function simulatePayment(
  orderId: string,
  method: "wechat" | "alipay"
): PaymentResult {
  const order = getOrderById(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  if (order.status !== "pending") {
    throw new Error("ORDER_ALREADY_PAID");
  }

  const now = new Date();
  const deadline = new Date(now.getTime() + 15 * 60 * 1000);

  updateOrderStatus(orderId, "paid");

  return {
    orderId,
    plateNumber: order.plateNumber,
    amount: order.totalFee,
    method,
    paidAt: now.toISOString(),
    departureDeadline: deadline.toISOString(),
  };
}

export function getPaymentStatusById(orderId: string): PaymentStatusResponse | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  const resp: PaymentStatusResponse = {
    orderId: order.id,
    status: order.status,
  };

  if (order.status === "paid") {
    resp.paidAt = new Date().toISOString();
    resp.departureDeadline = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  }

  return resp;
}
