import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { parkingLotHandlers } from "./handlers/parking-lots";

export const worker = setupWorker(...authHandlers, ...parkingLotHandlers);
