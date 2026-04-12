import { describe, it, expect } from "vitest";
import { ApiClientError, apiClient } from "@/lib/api/client";

describe("ApiClientError", () => {
  it("creates error with correct properties", () => {
    const err = new ApiClientError({
      code: "INVALID_CREDENTIALS",
      message: "账号或密码错误",
      status: 401,
    });
    expect(err.message).toBe("账号或密码错误");
    expect(err.code).toBe("INVALID_CREDENTIALS");
    expect(err.status).toBe(401);
    expect(err.name).toBe("ApiClientError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiClientError);
  });
});
