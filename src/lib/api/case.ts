export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

function isProtoTimestamp(
  v: unknown
): v is { seconds?: number | string; nanos?: number } {
  if (!v || typeof v !== "object") return false;
  const keys = Object.keys(v as object);
  if (keys.length === 0 || keys.length > 2) return false;
  return keys.every((k) => k === "seconds" || k === "nanos");
}

function timestampToIso(t: {
  seconds?: number | string;
  nanos?: number;
}): string {
  const s = Number(t.seconds ?? 0);
  const n = Number(t.nanos ?? 0);
  return new Date(s * 1000 + Math.floor(n / 1e6)).toISOString();
}

export function keysToCamel<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToCamel(item)) as unknown as T;
  }
  if (input !== null && typeof input === "object") {
    if (isProtoTimestamp(input)) {
      return timestampToIso(input) as unknown as T;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[snakeToCamel(k)] = keysToCamel(v);
    }
    return out as T;
  }
  return input as T;
}

export function keysToSnake<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToSnake(item)) as unknown as T;
  }
  if (input !== null && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[camelToSnake(k)] = keysToSnake(v);
    }
    return out as T;
  }
  return input as T;
}
