import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("records MSW handlers", () => {
  it("GET /api/records returns paginated records", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records?page=1&pageSize=5");
    const json = await res.json();
    expect(json.data.data.length).toBeLessThanOrEqual(5);
    expect(json.data.total).toBeGreaterThan(0);
    expect(json.data.page).toBe(1);
  });

  it("GET /api/records filters by plateNumber", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records?plateNumber=沪A12345");
    const json = await res.json();
    json.data.data.forEach((r: { plateNumber: string }) => {
      expect(r.plateNumber).toContain("沪A12345");
    });
  });

  it("GET /api/records filters by status=exception", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records?status=exception");
    const json = await res.json();
    const exceptionStatuses = ["entry_no_exit", "exit_no_entry", "recognition_failed"];
    json.data.data.forEach((r: { status: string }) => {
      expect(exceptionStatuses).toContain(r.status);
    });
  });

  it("GET /api/records/summary returns exception counts", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records/summary");
    const json = await res.json();
    expect(json.data.totalExceptions).toBeGreaterThan(0);
    expect(json.data.entryNoExit).toBeGreaterThanOrEqual(0);
    expect(json.data.exitNoEntry).toBeGreaterThanOrEqual(0);
    expect(json.data.recognitionFailed).toBeGreaterThanOrEqual(0);
    expect(json.data.totalExceptions).toBe(
      json.data.entryNoExit + json.data.exitNoEntry + json.data.recognitionFailed
    );
  });

  it("GET /api/records/:id returns single record", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records/rec_026");
    const json = await res.json();
    expect(json.data.id).toBe("rec_026");
    expect(json.data.status).toBe("entry_no_exit");
  });

  it("GET /api/records/:id returns 404 for non-existent", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records/rec_nonexistent");
    expect(res.status).toBe(404);
  });

  it("PATCH /api/records/:id/exception handles exception record", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records/rec_026/exception", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plateNumber: "沪A99999", remark: "补录" }),
    });
    const json = await res.json();
    expect(json.data.plateNumber).toBe("沪A99999");
    expect(json.data.status).toBe("normal");
  });

  it("GET /api/records/export returns CSV", async () => {
    const { recordHandlers } = await import("@/mocks/handlers/records");
    server.use(...recordHandlers);

    const res = await fetch("/api/records/export");
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    const text = await res.text();
    expect(text).toContain("ID,车牌号");
  });
});
