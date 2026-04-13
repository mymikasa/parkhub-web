import type { BillingRule, CalculateFeeRequest, CalculateFeeResult } from "@/types";
import { mockParkingLots } from "./parking-lots";

export const mockBillingRules: BillingRule[] = [
  {
    id: "bill_001",
    parkingLotId: "lot_001",
    parkingLotName: "万科翡翠滨江地下停车场",
    freeDurationMinutes: 15,
    unitPrice: 8,
    dailyCap: 64,
    billingCycle: "hourly",
    enabled: true,
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "bill_002",
    parkingLotId: "lot_002",
    parkingLotName: "万科广场商业停车场",
    freeDurationMinutes: 30,
    unitPrice: 10,
    dailyCap: 80,
    billingCycle: "hourly",
    enabled: true,
    updatedAt: "2026-02-15T14:00:00Z",
  },
  {
    id: "bill_003",
    parkingLotId: "lot_003",
    parkingLotName: "万科城市花园停车场",
    freeDurationMinutes: 15,
    unitPrice: 6,
    dailyCap: 48,
    billingCycle: "hourly",
    enabled: true,
    updatedAt: "2026-03-05T09:30:00Z",
  },
  {
    id: "bill_004",
    parkingLotId: "lot_005",
    parkingLotName: "万科星城立体车库",
    freeDurationMinutes: 10,
    unitPrice: 8,
    dailyCap: 64,
    billingCycle: "half_hourly",
    enabled: true,
    updatedAt: "2026-02-28T11:00:00Z",
  },
  {
    id: "bill_005",
    parkingLotId: "lot_006",
    parkingLotName: "万科金域华府停车场",
    freeDurationMinutes: 15,
    unitPrice: 7,
    dailyCap: 56,
    billingCycle: "hourly",
    enabled: true,
    updatedAt: "2026-03-08T16:00:00Z",
  },
];

export function getBillingRuleByParkingLotId(parkingLotId: string): BillingRule | undefined {
  return mockBillingRules.find((r) => r.parkingLotId === parkingLotId);
}

export function getBillingRules(parkingLotId?: string): BillingRule[] {
  if (parkingLotId) {
    return mockBillingRules.filter((r) => r.parkingLotId === parkingLotId);
  }
  return [...mockBillingRules];
}

export function calculateFee(
  rule: BillingRule,
  entryTime: string,
  exitTime: string
): CalculateFeeResult {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const totalMinutes = Math.max(0, Math.round((exit.getTime() - entry.getTime()) / 60000));

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const duration = `${hours}小时${mins}分钟`;

  const freeMinutes = Math.min(rule.freeDurationMinutes, totalMinutes);
  const freeDuration = `${freeMinutes}分钟`;

  const billableMinutes = Math.max(0, totalMinutes - freeMinutes);
  const cycleMinutes = rule.billingCycle === "half_hourly" ? 30 : 60;
  const billableUnits = billableMinutes > 0 ? Math.ceil(billableMinutes / cycleMinutes) : 0;
  const roundedBillableHours = billableMinutes > 0 ? Math.ceil(billableMinutes / 60) : 0;

  const billableDuration =
    rule.billingCycle === "half_hourly"
      ? `${Math.floor(billableMinutes / 60)}小时${billableMinutes % 60}分钟 → ${billableUnits}个半小时`
      : `${Math.floor(billableMinutes / 60)}小时${billableMinutes % 60}分钟 → ${roundedBillableHours}小时`;

  let totalFee = billableUnits * rule.unitPrice;

  if (rule.dailyCap !== null) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((exit.getTime() - entry.getTime()) / msPerDay);
    const cappedFee = days * rule.dailyCap;
    totalFee = Math.min(totalFee, cappedFee);
  }

  totalFee = Math.round(totalFee * 100) / 100;

  return {
    duration,
    freeDuration,
    billableDuration,
    unitPrice: rule.unitPrice,
    totalFee,
  };
}
