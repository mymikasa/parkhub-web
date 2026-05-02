import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentService } from "@/lib/api/payment";
import type { PaymentRequest } from "@/types";

export const paymentKeys = {
  order: (plate: string) => ["payment", "order", plate] as const,
  status: (orderId: string) => ["payment", "status", orderId] as const,
};

export function usePaymentOrder(plate: string) {
  return useQuery({
    queryKey: paymentKeys.order(plate),
    queryFn: () => paymentService.getOrder(plate),
    enabled: !!plate,
  });
}

export function usePaymentStatus(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.status(orderId),
    queryFn: () => paymentService.getStatus(orderId),
    enabled: !!orderId,
    refetchInterval: 3000,
  });
}

export function usePayOrder() {
  return useMutation({
    mutationFn: (data: PaymentRequest) => paymentService.pay(data),
  });
}
