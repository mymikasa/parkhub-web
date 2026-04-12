import { describe, it, expect } from "vitest";
import { demoUser, generateToken, validateToken } from "@/mocks/data/users";

describe("mock user data", () => {
  it("demoUser has correct shape", () => {
    expect(demoUser.id).toBe("usr_super_001");
    expect(demoUser.name).toBe("超级管理员");
    expect(demoUser.email).toBe("admin@parkhub.test");
    expect(demoUser.phone).toBe("13800000000");
    expect(demoUser.role).toBe("super_admin");
  });

  describe("generateToken", () => {
    it("generates a token with the correct prefix", () => {
      const token = generateToken("user123");
      expect(token).toMatch(/^pkh_mock_user123_\d+_\d+$/);
    });

    it("generates unique tokens", () => {
      const t1 = generateToken("a");
      const t2 = generateToken("a");
      expect(t1).not.toBe(t2);
    });
  });

  describe("validateToken", () => {
    it("accepts valid mock tokens", () => {
      const token = generateToken("user1");
      expect(validateToken(token)).toBe(true);
    });

    it("rejects non-mock tokens", () => {
      expect(validateToken("invalid_token")).toBe(false);
    });

    it("rejects empty strings", () => {
      expect(validateToken("")).toBe(false);
    });
  });
});
