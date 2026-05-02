import { describe, it, expect } from "vitest";
import { createDeviceSchema, updateDeviceNameSchema, bindDeviceSchema } from "@/lib/api/contracts";

describe("createDeviceSchema", () => {
  it("validates valid input", () => {
    const result = createDeviceSchema.safeParse({
      id: "PH-DEV-001",
      type: "integrated",
    });
    expect(result.success).toBe(true);
  });

  it("requires id", () => {
    const result = createDeviceSchema.safeParse({
      id: "",
      type: "integrated",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("请输入设备ID");
    }
  });

  it("validates type enum", () => {
    const result = createDeviceSchema.safeParse({
      id: "PH-DEV-001",
      type: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid device types", () => {
    for (const type of ["integrated", "camera_only", "barrier_only"]) {
      const result = createDeviceSchema.safeParse({ id: "DEV-001", type });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional fields", () => {
    const result = createDeviceSchema.safeParse({
      id: "PH-DEV-001",
      name: "入口摄像头",
      type: "integrated",
      firmwareVersion: "v1.0.0",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateDeviceNameSchema", () => {
  it("requires name", () => {
    const result = updateDeviceNameSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid name", () => {
    const result = updateDeviceNameSchema.safeParse({ name: "新名称" });
    expect(result.success).toBe(true);
  });
});

describe("bindDeviceSchema", () => {
  it("requires parkingLotId and gateId", () => {
    const result = bindDeviceSchema.safeParse({ parkingLotId: "", gateId: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid binding", () => {
    const result = bindDeviceSchema.safeParse({ parkingLotId: "lot_001", gateId: "gate_001" });
    expect(result.success).toBe(true);
  });
});
