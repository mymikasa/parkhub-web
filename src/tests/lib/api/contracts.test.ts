import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { loginSchema, smsLoginSchema } from "@/lib/api/contracts";

describe("loginSchema validation", () => {
  it("accepts valid email login", () => {
    const result = loginSchema.safeParse({
      email: "admin@parkhub.test",
      password: "ParkHub123",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "ParkHub123",
      rememberMe: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "ParkHub123",
      rememberMe: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "admin@parkhub.test",
      password: "",
      rememberMe: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("smsLoginSchema validation", () => {
  it("accepts valid phone and code", () => {
    const result = smsLoginSchema.safeParse({
      phone: "13800000000",
      code: "123456",
      rememberMe: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone format", () => {
    const result = smsLoginSchema.safeParse({
      phone: "12345",
      code: "123456",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-6-digit code", () => {
    const result = smsLoginSchema.safeParse({
      phone: "13800000000",
      code: "12345",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const result = smsLoginSchema.safeParse({
      phone: "",
      code: "123456",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });
});
