import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/lib/api/billing";
import type { BillingRuleListParams, UpdateBillingRuleRequest, CalculateFeeRequest } from "@/types";

export const billingKeys = {
  all: ["billing"] as const,
  rules: (params?: BillingRuleListParams) => [...billingKeys.all, "rules", params] as const,
  calculate: () => [...billingKeys.all, "calculate"] as const,
};

export function useBillingRules(params?: BillingRuleListParams) {
  return useQuery({
    queryKey: billingKeys.rules(params),
    queryFn: () => billingService.list(params),
  });
}

export function useUpdateBillingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillingRuleRequest }) =>
      billingService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useCalculateFee() {
  return useMutation({
    mutationFn: (data: CalculateFeeRequest) => billingService.calculate(data),
  });
}
