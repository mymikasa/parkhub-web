import { client } from "@/lib/api/generated/client.gen";
import { loadSession, clearSession } from "@/lib/session/storage";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { keysToCamel, keysToSnake } from "@/lib/api/case";
import type { Session } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const raw =
    localStorage.getItem(AUTH_STORAGE_KEY) ??
    sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return false;

  const session: Session = JSON.parse(raw);
  if (!session?.refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/identity/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    const data = keysToCamel<{
      accessToken: string;
      refreshToken: string;
      accessExpiresIn: number;
    }>(json);

    if (!data.accessToken) return false;

    const updated: Session = {
      ...session,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? session.refreshToken,
      expiresAt: data.accessExpiresIn
        ? Date.now() + data.accessExpiresIn * 1000
        : session.expiresAt,
    };
    const storage = session.rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export function initApiClient() {
  client.setConfig({
    baseUrl: BASE_URL || undefined,
  });

  client.interceptors.request.use((request: Request) => {
    if (request.body && typeof request.body === "string") {
      try {
        const parsed = JSON.parse(request.body);
        const snake = JSON.stringify(keysToSnake(parsed));
        request = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: snake,
        });
      } catch {}
    }

    const session = loadSession();
    if (session?.accessToken) {
      request.headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
    return request;
  });

  client.interceptors.response.use(
    async (response: Response, request: Request) => {
      if (response.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const session = loadSession();
          if (session?.accessToken) {
            const newHeaders = new Headers(request.headers);
            newHeaders.set(
              "Authorization",
              `Bearer ${session.accessToken}`
            );
            return fetch(
              new Request(request.url, {
                method: request.method,
                headers: newHeaders,
                body: request.body,
              })
            );
          }
        }
        clearSession();
        return response;
      }

      if (response.status === 204 || !response.ok) return response;
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("json")) return response;

      try {
        const json = await response.json();
        const camel = keysToCamel(json);
        return new Response(JSON.stringify(camel), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch {
        return response;
      }
    }
  );
}
