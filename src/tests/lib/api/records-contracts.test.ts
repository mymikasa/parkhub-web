import { describe, it, expect } from "vitest";
import { exceptionHandleSchema } from "@/lib/api/contracts";

describe("exceptionHandleSchema", () => {
  it("validates valid input", () => {
    const result = exceptionHandleSchema.safeParse({
      plateNumber: "沪A12345",
      remark: "补录车牌",
    });
    expect(result.success).toBe(true);
  });

  it("requires plateNumber", () => {
    const result = exceptionHandleSchema.safeParse({
      plateNumber: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("请输入车牌号");
    }
  });

  it("allows omitting remark", () => {
    const result = exceptionHandleSchema.safeParse({
      plateNumber: "沪A12345",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty remark", () => {
    const result = exceptionHandleSchema.safeParse({
      plateNumber: "沪A12345",
      remark: "",
    });
    expect(result.success).toBe(true);
  });
});
