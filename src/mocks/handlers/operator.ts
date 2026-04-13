import { http, HttpResponse, delay } from "msw";
import {
  getOperatorEvents,
  getOperatorExceptions,
  mockVehicleResult,
} from "../data/operator";

export const operatorHandlers = [
  http.get("/api/operator/events", async () => {
    await delay(200);
    return HttpResponse.json({ data: getOperatorEvents() });
  }),

  http.get("/api/operator/exceptions", async () => {
    await delay(300);
    return HttpResponse.json({ data: getOperatorExceptions() });
  }),

  http.post("/api/operator/actions/lift-barrier", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { parkingLotId: string; laneId: string };
    return HttpResponse.json({
      data: {
        success: true,
        message: `道闸已抬起`,
      },
    });
  }),

  http.post("/api/operator/actions/manual-charge", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { plateNumber: string; amount: number };
    return HttpResponse.json({
      data: {
        success: true,
        message: `已对 ${body.plateNumber} 收费 ¥${body.amount.toFixed(2)}`,
      },
    });
  }),

  http.post("/api/operator/actions/correct-plate", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { plateNumber: string };
    return HttpResponse.json({
      data: {
        success: true,
        message: `车牌已更正为 ${body.plateNumber}`,
      },
    });
  }),

  http.get("/api/operator/vehicles/search", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const plateNumber = url.searchParams.get("plateNumber");

    if (!plateNumber) {
      return HttpResponse.json({ data: null });
    }

    if (plateNumber.includes("88888") || plateNumber.includes("沪A")) {
      return HttpResponse.json({ data: mockVehicleResult });
    }

    return HttpResponse.json({ data: null });
  }),
];
