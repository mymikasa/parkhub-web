import { http, HttpResponse, delay } from "msw";
import { mockRecords, getRecordSummary } from "../data/records";
import type { RecordStatus } from "@/types";

const exceptionStatuses: RecordStatus[] = ["entry_no_exit", "exit_no_entry", "recognition_failed"];

export const recordHandlers = [
  http.get("/api/records/summary", async () => {
    await delay(200);
    return HttpResponse.json({ data: getRecordSummary() });
  }),

  http.get("/api/records/export", async () => {
    await delay(300);
    const csvHeader = "ID,车牌号,停车场,出入口,类型,状态,费用,时间\n";
    const csvRows = mockRecords
      .map(
        (r) =>
          `${r.id},${r.plateNumber},${r.parkingLotName},${r.laneName},${r.type},${r.status},${r.fee ?? ""},${r.time}`
      )
      .join("\n");
    return new HttpResponse(csvHeader + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=records.csv",
      },
    });
  }),

  http.get("/api/records/:id", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const record = mockRecords.find((r) => r.id === id);
    if (!record) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "记录不存在" },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: record });
  }),

  http.get("/api/records", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const plateNumber = url.searchParams.get("plateNumber");
    const parkingLotId = url.searchParams.get("parkingLotId");
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    let filtered = [...mockRecords];

    if (dateFrom) {
      filtered = filtered.filter((r) => r.time >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((r) => r.time <= dateTo);
    }
    if (plateNumber) {
      filtered = filtered.filter((r) =>
        r.plateNumber.toLowerCase().includes(plateNumber.toLowerCase())
      );
    }
    if (parkingLotId) {
      filtered = filtered.filter((r) => r.parkingLotId === parkingLotId);
    }
    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }
    if (status) {
      if (status === "exception") {
        filtered = filtered.filter((r) => exceptionStatuses.includes(r.status));
      } else {
        filtered = filtered.filter((r) => r.status === status);
      }
    }

    // Sort by time descending
    filtered.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: { data, total, page, pageSize },
    });
  }),

  http.patch("/api/records/:id/exception", async ({ params, request }) => {
    await delay(400);
    const id = params.id as string;
    const record = mockRecords.find((r) => r.id === id);

    if (!record) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "记录不存在" },
        { status: 404 }
      );
    }

    if (!exceptionStatuses.includes(record.status)) {
      return HttpResponse.json(
        { code: "INVALID_STATUS", message: "该记录不是异常状态" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { plateNumber: string; remark?: string };
    record.plateNumber = body.plateNumber;
    record.status = "normal";

    return HttpResponse.json({ data: record });
  }),
];
