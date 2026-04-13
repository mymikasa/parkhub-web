import { describe, it, expect } from "vitest";
import { createTenantSchema, updateTenantSchema } from "@/lib/api/contracts";

describe("tenant contracts", () => {
  describe("createTenantSchema", () => {
    it("validates valid input", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "张明辉",
        contactPhone: "13888881234",
      });
      expect(result.success).toBe(true);
    });

    it("requires companyName", () => {
      const result = createTenantSchema.safeParse({
        companyName: "",
        contactPerson: "张明辉",
        contactPhone: "13888881234",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("请输入公司名称");
      }
    });

    it("requires contactPerson", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "",
        contactPhone: "13888881234",
      });
      expect(result.success).toBe(false);
    });

    it("requires valid phone number", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "张明辉",
        contactPhone: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("请输入有效的手机号");
      }
    });

    it("accepts optional fields", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "张明辉",
        contactPhone: "13888881234",
        description: "子公司",
        creditCode: "91310000607233001X",
        adminEmail: "admin@vanke.com",
        remark: "备注",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "张明辉",
        contactPhone: "13888881234",
        adminEmail: "invalid-email",
      });
      expect(result.success).toBe(false);
    });

    it("accepts empty string for adminEmail", () => {
      const result = createTenantSchema.safeParse({
        companyName: "万科物业",
        contactPerson: "张明辉",
        contactPhone: "13888881234",
        adminEmail: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateTenantSchema", () => {
    it("allows partial updates", () => {
      const result = updateTenantSchema.safeParse({
        companyName: "新名称",
      });
      expect(result.success).toBe(true);
    });

    it("allows empty object", () => {
      const result = updateTenantSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("validates phone when provided", () => {
      const result = updateTenantSchema.safeParse({
        contactPhone: "123",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid phone", () => {
      const result = updateTenantSchema.safeParse({
        contactPhone: "13900001111",
      });
      expect(result.success).toBe(true);
    });
  });
});
