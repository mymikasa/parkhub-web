import { http, HttpResponse, delay } from "msw";
import { mockBillingRules, getBillingRules, getBillingRuleByParkingLotId, calculateFee } from "../data/billing";

export const billingHandlers = [
  http.get("/api/billing-rules", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const parkingLotId = url.searchParams.get("parkingLotId");

    const rules = getBillingRules(parkingLotId ?? undefined);
    return HttpResponse.json({ data: rules });
  }),

  http.put("/api/billing-rules/:id", async ({ params, request }) => {
    await delay(400);
    const id = params.id as string;
    const rule = mockBillingRules.find((r) => r.id === id);

    if (!rule) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "计费规则不存在" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (body.freeDurationMinutes !== undefined) {
      const val = Number(body.freeDurationMinutes);
      if (val < 0 || val > 120) {
        return HttpResponse.json(
          { code: "INVALID_PARAM", message: "免费时长范围为0-120分钟" },
          { status: 400 }
        );
      }
      rule.freeDurationMinutes = val;
    }
    if (body.unitPrice !== undefined) {
      const val = Number(body.unitPrice);
      if (val < 0.5 || val > 50) {
        return HttpResponse.json(
          { code: "INVALID_PARAM", message: "单价范围为0.5-50元" },
          { status: 400 }
        );
      }
      rule.unitPrice = val;
    }
    if (body.dailyCap !== undefined) {
      if (body.dailyCap !== null) {
        const val = Number(body.dailyCap);
        if (val < 0 || val > 500) {
          return HttpResponse.json(
            { code: "INVALID_PARAM", message: "每日封顶范围为0-500元" },
            { status: 400 }
          );
        }
      }
      rule.dailyCap = body.dailyCap as number | null;
    }
    if (body.billingCycle !== undefined) {
      rule.billingCycle = body.billingCycle as "hourly" | "half_hourly";
    }

    rule.updatedAt = new Date().toISOString();

    return HttpResponse.json({ data: rule });
  }),

  http.post("/api/billing-rules/calculate", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      parkingLotId: string;
      entryTime: string;
      exitTime: string;
    };

    if (!body.parkingLotId || !body.entryTime || !body.exitTime) {
      return HttpResponse.json(
        { code: "INVALID_PARAM", message: "缺少必要参数" },
        { status: 400 }
      );
    }

    const rule = getBillingRuleByParkingLotId(body.parkingLotId);
    if (!rule) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "该停车场无计费规则" },
        { status: 404 }
      );
    }

    const result = calculateFee(rule, body.entryTime, body.exitTime);
    return HttpResponse.json({ data: result });
  }),
];
