import type { ApiError } from "@/types";
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

const REAL_API_PREFIXES = ["/identity/", "/tenant/"];

function isRealApiPath(path: string): boolean {
  return REAL_API_PREFIXES.some((p) => path.startsWith(p));
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (BASE_URL && isRealApiPath(path)) return `${BASE_URL}${path}`;
  return path;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ??
      sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.accessToken ?? session?.token ?? null;
  } catch {
    return null;
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
