import { describe, it, expect } from "vitest";
import { paymentSchema } from "@/lib/api/contracts";

describe("payment contracts", () => {
  describe("paymentSchema", () => {
    it("validates valid wechat payment", () => {
      const result = paymentSchema.safeParse({
        orderId: "pay_001",
        method: "wechat",
      });
      expect(result.success).toBe(true);
    });

    it("validates valid alipay payment", () => {
      const result = paymentSchema.safeParse({
        orderId: "pay_001",
        method: "alipay",
      });
      expect(result.success).toBe(true);
    });

    it("requires orderId", () => {
      const result = paymentSchema.safeParse({
        method: "wechat",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty orderId", () => {
      const result = paymentSchema.safeParse({
        orderId: "",
        method: "wechat",
      });
      expect(result.success).toBe(false);
    });

    it("requires method", () => {
      const result = paymentSchema.safeParse({
        orderId: "pay_001",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid method", () => {
      const result = paymentSchema.safeParse({
        orderId: "pay_001",
        method: "credit_card",
      });
      expect(result.success).toBe(false);
    });
  });
});
