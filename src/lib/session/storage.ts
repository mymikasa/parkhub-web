import type { Session, User } from "@/types";
import { AUTH_STORAGE_KEY } from "@/lib/constants";

const DEFAULT_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function saveSession(session: Session): void {
  const storage = getStorage(session.rememberMe);
  clearAllSessionStorage();
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem(AUTH_STORAGE_KEY) ??
    sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  clearAllSessionStorage();
}

export function createSession(
  accessToken: string,
  user: User,
  rememberMe: boolean,
  options?: { refreshToken?: string; expiresInSeconds?: number }
): Session {
  const expiresInMs = options?.expiresInSeconds
    ? options.expiresInSeconds * 1000
    : DEFAULT_SESSION_DURATION_MS;
  return {
    accessToken,
    refreshToken: options?.refreshToken,
    user,
    expiresAt: Date.now() + expiresInMs,
    rememberMe,
  };
}

function clearAllSessionStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
