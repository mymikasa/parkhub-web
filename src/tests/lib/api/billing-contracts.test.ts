import { describe, it, expect } from "vitest";
import { updateBillingRuleSchema, calculateFeeSchema } from "@/lib/api/contracts";

describe("billing contracts", () => {
  describe("updateBillingRuleSchema", () => {
    it("validates valid input", () => {
      const result = updateBillingRuleSchema.safeParse({
        freeDurationMinutes: 15,
        unitPrice: 8,
        dailyCap: 64,
        billingCycle: "hourly",
      });
      expect(result.success).toBe(true);
    });

    it("allows partial updates", () => {
      const result = updateBillingRuleSchema.safeParse({
        unitPrice: 10,
      });
      expect(result.success).toBe(true);
    });

    it("allows empty object", () => {
      const result = updateBillingRuleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("coerces string freeDurationMinutes to number", () => {
      const result = updateBillingRuleSchema.safeParse({
        freeDurationMinutes: "30",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.freeDurationMinutes).toBe(30);
      }
    });

    it("rejects freeDurationMinutes > 120", () => {
      const result = updateBillingRuleSchema.safeParse({
        freeDurationMinutes: 150,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative freeDurationMinutes", () => {
      const result = updateBillingRuleSchema.safeParse({
        freeDurationMinutes: -1,
      });
      expect(result.success).toBe(false);
    });

    it("allows null dailyCap", () => {
      const result = updateBillingRuleSchema.safeParse({
        dailyCap: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid billingCycle", () => {
      const result = updateBillingRuleSchema.safeParse({
        billingCycle: "quarterly",
      });
      expect(result.success).toBe(false);
    });

    it("allows half_hourly billingCycle", () => {
      const result = updateBillingRuleSchema.safeParse({
        billingCycle: "half_hourly",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("calculateFeeSchema", () => {
    it("validates valid input", () => {
      const result = calculateFeeSchema.safeParse({
        parkingLotId: "lot_001",
        entryTime: "2026-03-13T09:30:00Z",
        exitTime: "2026-03-13T14:30:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("requires parkingLotId", () => {
      const result = calculateFeeSchema.safeParse({
        entryTime: "2026-03-13T09:30:00Z",
        exitTime: "2026-03-13T14:30:00Z",
      });
      expect(result.success).toBe(false);
    });

    it("requires entryTime", () => {
      const result = calculateFeeSchema.safeParse({
        parkingLotId: "lot_001",
        exitTime: "2026-03-13T14:30:00Z",
      });
      expect(result.success).toBe(false);
    });

    it("requires exitTime", () => {
      const result = calculateFeeSchema.safeParse({
        parkingLotId: "lot_001",
        entryTime: "2026-03-13T09:30:00Z",
      });
      expect(result.success).toBe(false);
    });
  });
});
