import { apiClient } from "./client";
import type {
  BillingRule,
  BillingRuleListParams,
  UpdateBillingRuleRequest,
  CalculateFeeRequest,
  CalculateFeeResult,
} from "@/types";

export const billingService = {
  list(params?: BillingRuleListParams): Promise<BillingRule[]> {
    const query = new URLSearchParams();
    if (params?.parkingLotId) query.set("parkingLotId", params.parkingLotId);
    const qs = query.toString();
    return apiClient.get(`/api/billing-rules${qs ? `?${qs}` : ""}`);
  },

  update(id: string, data: UpdateBillingRuleRequest): Promise<BillingRule> {
    return apiClient.put(`/api/billing-rules/${id}`, data);
  },

  calculate(data: CalculateFeeRequest): Promise<CalculateFeeResult> {
    return apiClient.post("/api/billing-rules/calculate", data);
  },
};
