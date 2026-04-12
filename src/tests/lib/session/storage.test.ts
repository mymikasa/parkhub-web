import { describe, it, expect, beforeEach } from "vitest";
import {
  saveSession,
  loadSession,
  clearSession,
  createSession,
} from "@/lib/session/storage";
import type { Session } from "@/types";

const mockSession = (overrides?: Partial<Session>): Session => ({
  token: "pkh_mock_test_token",
  user: {
    id: "usr_001",
    name: "测试用户",
    email: "test@parkhub.test",
    phone: "13800000001",
    role: "super_admin",
  },
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  rememberMe: true,
  ...overrides,
});

describe("session storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("saveSession + loadSession", () => {
    it("saves to localStorage when rememberMe is true", () => {
      const session = mockSession({ rememberMe: true });
      saveSession(session);
      expect(localStorage.getItem("parkhub_session")).toBeTruthy();
      expect(sessionStorage.getItem("parkhub_session")).toBeNull();
    });

    it("saves to sessionStorage when rememberMe is false", () => {
      const session = mockSession({ rememberMe: false });
      saveSession(session);
      expect(sessionStorage.getItem("parkhub_session")).toBeTruthy();
      expect(localStorage.getItem("parkhub_session")).toBeNull();
    });

    it("loads session from localStorage", () => {
      const session = mockSession({ rememberMe: true });
      saveSession(session);
      const loaded = loadSession();
      expect(loaded).toBeTruthy();
      expect(loaded!.token).toBe(session.token);
      expect(loaded!.user.name).toBe(session.user.name);
    });

    it("loads session from sessionStorage", () => {
      const session = mockSession({ rememberMe: false });
      saveSession(session);
      const loaded = loadSession();
      expect(loaded).toBeTruthy();
      expect(loaded!.token).toBe(session.token);
    });

    it("returns null when no session exists", () => {
      expect(loadSession()).toBeNull();
    });

    it("returns null and clears expired session", () => {
      const session = mockSession({ expiresAt: Date.now() - 1000 });
      saveSession(session);
      expect(loadSession()).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("removes session from both storages", () => {
      const session = mockSession();
      saveSession(session);
      clearSession();
      expect(localStorage.getItem("parkhub_session")).toBeNull();
      expect(sessionStorage.getItem("parkhub_session")).toBeNull();
    });
  });

  describe("createSession", () => {
    it("creates a session with correct structure", () => {
      const session = createSession("token123", mockSession().user, true);
      expect(session.token).toBe("token123");
      expect(session.rememberMe).toBe(true);
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });
  });
});
