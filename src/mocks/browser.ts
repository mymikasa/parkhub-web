import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { parkingLotHandlers } from "./handlers/parking-lots";
import { recordHandlers } from "./handlers/records";
import { deviceHandlers } from "./handlers/devices";
import { tenantHandlers } from "./handlers/tenants";
import { billingHandlers } from "./handlers/billing";

export const worker = setupWorker(
  ...authHandlers,
  ...parkingLotHandlers,
  ...recordHandlers,
  ...deviceHandlers,
  ...tenantHandlers,
  ...billingHandlers
);
