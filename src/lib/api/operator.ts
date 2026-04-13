import { apiClient } from "./client";
import type {
  OperatorEvent,
  OperatorException,
  LiftBarrierRequest,
  ManualChargeRequest,
  CorrectPlateRequest,
  VehicleSearchResult,
} from "@/types";

export const operatorService = {
  getEvents(): Promise<OperatorEvent[]> {
    return apiClient.get("/api/operator/events");
  },

  getExceptions(): Promise<OperatorException[]> {
    return apiClient.get("/api/operator/exceptions");
  },

  liftBarrier(data: LiftBarrierRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post("/api/operator/actions/lift-barrier", data);
  },

  manualCharge(data: ManualChargeRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post("/api/operator/actions/manual-charge", data);
  },

  correctPlate(data: CorrectPlateRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post("/api/operator/actions/correct-plate", data);
  },

  searchVehicle(plateNumber: string): Promise<VehicleSearchResult | null> {
    return apiClient.get(`/api/operator/vehicles/search?plateNumber=${encodeURIComponent(plateNumber)}`);
  },
};
