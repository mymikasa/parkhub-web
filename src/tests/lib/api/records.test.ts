import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { recordService } from "@/lib/api/records";

const mockRecord = {
  id: "rec_001",
  plateNumber: "沪A12345",
  parkingLotId: "lot_001",
  parkingLotName: "万科翡翠滨江地下停车场",
  laneName: "1号入口",
  type: "entry",
  status: "normal",
  fee: null,
  time: "2024-12-21T10:00:00Z",
};

const mockSummary = {
  totalExceptions: 5,
  entryNoExit: 3,
  exitNoEntry: 1,
  recognitionFailed: 1,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("recordService", () => {
  it("list calls GET /api/records with filters", async () => {
    server.use(
      http.get("/api/records", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("pageSize")).toBe("10");
        expect(url.searchParams.get("plateNumber")).toBe("沪A");
        return HttpResponse.json({
          data: { data: [mockRecord], total: 1, page: 1, pageSize: 10 },
        });
      })
    );

    const result = await recordService.list({ page: 1, pageSize: 10, plateNumber: "沪A" });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("getSummary calls GET /api/records/summary", async () => {
    server.use(
      http.get("/api/records/summary", () => {
        return HttpResponse.json({ data: mockSummary });
      })
    );

    const result = await recordService.getSummary();
    expect(result).toEqual(mockSummary);
  });

  it("getById calls GET /api/records/:id", async () => {
    server.use(
      http.get("/api/records/rec_001", () => {
        return HttpResponse.json({ data: mockRecord });
      })
    );

    const result = await recordService.getById("rec_001");
    expect(result.id).toBe("rec_001");
    expect(result.plateNumber).toBe("沪A12345");
  });

  it("handleException calls PATCH /api/records/:id/exception", async () => {
    server.use(
      http.patch("/api/records/rec_001/exception", async ({ request }) => {
        const body = (await request.json()) as Record<string, string>;
        expect(body.plateNumber).toBe("沪B99999");
        return HttpResponse.json({
          data: { ...mockRecord, plateNumber: "沪B99999", status: "normal" },
        });
      })
    );

    const result = await recordService.handleException("rec_001", {
      plateNumber: "沪B99999",
      remark: "补录",
    });
    expect(result.plateNumber).toBe("沪B99999");
    expect(result.status).toBe("normal");
  });
});
