import type { ApiError } from "@/types";

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

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("parkhub_session") ?? sessionStorage.getItem("parkhub_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token ?? null;
  } catch {
    return null;
  }
}

function normalizeError(status: number, body: unknown): ApiClientError {
  const err = body as Record<string, unknown>;
  return new ApiClientError({
    code: String(err.code ?? "UNKNOWN"),
    message: String(err.message ?? "请求失败"),
    status,
  });
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    throw normalizeError(res.status, body);
  }

  const json = await res.json();
  return (json as { data: T }).data ?? json;
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
