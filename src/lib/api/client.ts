import type { ApiError, Session } from "@/types";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { keysToCamel, keysToSnake } from "./case";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(error: ApiError) {
    super(error.message);
    this.code = error.code;
    this.status = error.status;
    this.name = "ApiClientError";
  }
}

const REAL_API_PREFIXES = ["/identity/", "/tenant/", "/api/v1/", "/parking/", "/iot/"];

function isRealApiPath(path: string): boolean {
  return REAL_API_PREFIXES.some((p) => path.startsWith(p));
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (BASE_URL && isRealApiPath(path)) return `${BASE_URL}${path}`;
  return path;
}

function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ??
      sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  return getSession()?.accessToken ?? null;
}

function saveUpdatedSession(session: Session, newAccessToken: string, newRefreshToken?: string, expiresIn?: number): void {
  const updated: Session = {
    ...session,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken ?? session.refreshToken,
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : session.expiresAt,
  };
  const storage = session.rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
}

function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}


function normalizeError(status: number, body: unknown): ApiClientError {
  const err = (body ?? {}) as Record<string, unknown>;
  return new ApiClientError({
    code: String(err.error ?? err.code ?? "UNKNOWN"),
    message: String(err.message ?? "请求失败"),
    status,
  });
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;

  const hasNewerSession = () => {
    const latest = getSession();
    return (
      !!latest?.accessToken &&
      !!latest.refreshToken &&
      latest.refreshToken !== session.refreshToken
    );
  };

  try {
    const res = await fetch(resolveUrl("/identity/v1/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!res.ok) return hasNewerSession();

    const json = await res.json();
    const data = keysToCamel<{
      accessToken: string;
      refreshToken: string;
      accessExpiresIn: number;
    }>(json);

    if (!data.accessToken) return false;

    saveUpdatedSession(
      session,
      data.accessToken,
      data.refreshToken,
      data.accessExpiresIn
    );
    return true;
  } catch {
    return hasNewerSession();
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const real = isRealApiPath(path);
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body = options.body;
  if (real && typeof body === "string") {
    try {
      body = JSON.stringify(keysToSnake(JSON.parse(body)));
    } catch {
      // body 不是合法 JSON 字符串就原样发出
    }
  }

  const res = await fetch(resolveUrl(path), {
    ...options,
    headers,
    body,
  });

  if (res.status === 401 && getToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = getToken();
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      if (newToken) {
        retryHeaders["Authorization"] = `Bearer ${newToken}`;
      }
      const retryRes = await fetch(resolveUrl(path), {
        ...options,
        headers: retryHeaders,
        body: options.body,
      });
      if (!retryRes.ok) {
        let errBody: unknown;
        try {
          errBody = await retryRes.json();
        } catch {
          errBody = {};
        }
        throw normalizeError(retryRes.status, errBody);
      }
      if (retryRes.status === 204) return undefined as T;
      const retryJson = await retryRes.json().catch(() => ({}));
      if (real) {
        return keysToCamel<T>(retryJson);
      }
      return ((retryJson as { data?: unknown })?.data ?? retryJson) as T;
    }
    clearSession();
  }

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      errBody = {};
    }
    throw normalizeError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));
  if (real) {
    return keysToCamel<T>(json);
  }
  return ((json as { data?: unknown })?.data ?? json) as T;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
