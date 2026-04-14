import { apiClient } from "./client";
import type {
  PaymentOrder,
  PaymentRequest,
  PaymentResult,
  PaymentStatusResponse,
} from "@/types";

export const paymentService = {
  getOrder(plateNumber: string): Promise<PaymentOrder> {
    return apiClient.get(`/api/payment/orders/${encodeURIComponent(plateNumber)}`);
  },

  pay(data: PaymentRequest): Promise<PaymentResult> {
    return apiClient.post("/api/payment/pay", data);
  },

  getStatus(orderId: string): Promise<PaymentStatusResponse> {
    return apiClient.get(`/api/payment/pay/${orderId}/status`);
  },
};
