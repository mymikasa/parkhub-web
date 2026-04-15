import { setupWorker } from "msw/browser";
import type { RequestHandler } from "msw";
import { authHandlers } from "./handlers/auth";
import { parkingLotHandlers } from "./handlers/parking-lots";
import { recordHandlers } from "./handlers/records";
import { deviceHandlers } from "./handlers/devices";
import { tenantHandlers } from "./handlers/tenants";
import { billingHandlers } from "./handlers/billing";
import { monitorHandlers } from "./handlers/monitor";
import { operatorHandlers } from "./handlers/operator";
import { paymentHandlers } from "./handlers/payment";

const MODULE_HANDLERS: Record<string, RequestHandler[]> = {
  auth: authHandlers,
  "parking-lots": parkingLotHandlers,
  records: recordHandlers,
  devices: deviceHandlers,
  tenants: tenantHandlers,
  billing: billingHandlers,
  monitor: monitorHandlers,
  operator: operatorHandlers,
  payment: paymentHandlers,
};

function resolveEnabledModules(): string[] {
  const raw = process.env.NEXT_PUBLIC_MOCK_MODULES ?? "";
  if (!raw.trim()) return Object.keys(MODULE_HANDLERS);
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

const enabled = resolveEnabledModules();
const handlers = enabled.flatMap((m) => MODULE_HANDLERS[m] ?? []);

export const worker = setupWorker(...handlers);
