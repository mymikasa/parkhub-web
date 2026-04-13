import { apiClient } from "./client";
import type {
  ParkingLot,
  ParkingLotSummary,
  Lane,
  LaneConfigResponse,
  CreateParkingLotRequest,
  UpdateParkingLotRequest,
  UpdateLanesRequest,
  PaginatedResponse,
} from "@/types";

export const parkingLotService = {
  getSummary(): Promise<ParkingLotSummary> {
    return apiClient.get("/api/parking-lots/summary");
  },

  list(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<PaginatedResponse<ParkingLot>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.keyword) query.set("keyword", params.keyword);
    const qs = query.toString();
    return apiClient.get(`/api/parking-lots${qs ? `?${qs}` : ""}`);
  },

  create(data: CreateParkingLotRequest): Promise<ParkingLot> {
    return apiClient.post("/api/parking-lots", data);
  },

  update(id: string, data: UpdateParkingLotRequest): Promise<ParkingLot> {
    return apiClient.patch(`/api/parking-lots/${id}`, data);
  },

  getLaneConfig(parkingLotId: string): Promise<LaneConfigResponse> {
    return apiClient.get(`/api/parking-lots/${parkingLotId}/lanes`);
  },

  updateLanes(
    parkingLotId: string,
    data: UpdateLanesRequest
  ): Promise<Lane[]> {
    return apiClient.put(`/api/parking-lots/${parkingLotId}/lanes`, data);
  },
};
