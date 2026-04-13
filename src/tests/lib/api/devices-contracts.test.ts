import { describe, it, expect } from "vitest";
import { registerDeviceSchema } from "@/lib/api/contracts";

describe("registerDeviceSchema", () => {
  it("validates valid input", () => {
    const result = registerDeviceSchema.safeParse({
      serialNumber: "PH-DEV-001",
      parkingLotId: "lot_001",
      laneId: "lane_001",
      type: "integrated",
    });
    expect(result.success).toBe(true);
  });

  it("requires serialNumber", () => {
    const result = registerDeviceSchema.safeParse({
      serialNumber: "",
      parkingLotId: "lot_001",
      laneId: "lane_001",
      type: "integrated",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("请输入设备序列号");
    }
  });

  it("requires parkingLotId", () => {
    const result = registerDeviceSchema.safeParse({
      serialNumber: "PH-DEV-001",
      parkingLotId: "",
      laneId: "lane_001",
      type: "integrated",
    });
    expect(result.success).toBe(false);
  });

  it("requires laneId", () => {
    const result = registerDeviceSchema.safeParse({
      serialNumber: "PH-DEV-001",
      parkingLotId: "lot_001",
      laneId: "",
      type: "integrated",
    });
    expect(result.success).toBe(false);
  });

  it("validates type enum", () => {
    const result = registerDeviceSchema.safeParse({
      serialNumber: "PH-DEV-001",
      parkingLotId: "lot_001",
      laneId: "lane_001",
      type: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid device types", () => {
    for (const type of ["integrated", "camera_only", "barrier_only"]) {
      const result = registerDeviceSchema.safeParse({
        serialNumber: "PH-DEV-001",
        parkingLotId: "lot_001",
        laneId: "lane_001",
        type,
      });
      expect(result.success).toBe(true);
    }
  });
});
