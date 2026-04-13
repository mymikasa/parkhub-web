import { describe, it, expect } from "vitest";
import { createParkingLotSchema, updateParkingLotSchema } from "@/lib/api/contracts";

describe("parking-lot contracts", () => {
  describe("createParkingLotSchema", () => {
    it("validates valid input", () => {
      const result = createParkingLotSchema.safeParse({
        name: "测试车场",
        address: "测试地址",
        totalSpots: 100,
        type: "underground",
      });
      expect(result.success).toBe(true);
    });

    it("requires name", () => {
      const result = createParkingLotSchema.safeParse({
        name: "",
        address: "地址",
        totalSpots: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("请输入车场名称");
      }
    });

    it("requires address", () => {
      const result = createParkingLotSchema.safeParse({
        name: "名称",
        address: "",
        totalSpots: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("请输入车场地址");
      }
    });

    it("requires positive totalSpots", () => {
      const result = createParkingLotSchema.safeParse({
        name: "名称",
        address: "地址",
        totalSpots: -1,
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional type", () => {
      const result = createParkingLotSchema.safeParse({
        name: "名称",
        address: "地址",
        totalSpots: 100,
      });
      expect(result.success).toBe(true);
    });

    it("coerces string totalSpots to number", () => {
      const result = createParkingLotSchema.safeParse({
        name: "名称",
        address: "地址",
        totalSpots: "100",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalSpots).toBe(100);
      }
    });
  });

  describe("updateParkingLotSchema", () => {
    it("allows partial updates", () => {
      const result = updateParkingLotSchema.safeParse({
        name: "新名称",
      });
      expect(result.success).toBe(true);
    });

    it("allows empty object", () => {
      const result = updateParkingLotSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("validates status enum", () => {
      const result = updateParkingLotSchema.safeParse({
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid status", () => {
      const result = updateParkingLotSchema.safeParse({
        status: "suspended",
      });
      expect(result.success).toBe(true);
    });
  });
});
