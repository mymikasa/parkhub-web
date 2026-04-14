import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentSuccessModal } from "@/components/payment/payment-success-modal";
import type { PaymentResult } from "@/types";

const mockResult: PaymentResult = {
  orderId: "pay_001",
  plateNumber: "沪A·88888",
  amount: 40,
  method: "wechat",
  paidAt: "2026-03-13T14:32:00Z",
  departureDeadline: "2026-03-13T14:47:00Z",
};

describe("PaymentSuccessModal", () => {
  it("renders success modal with payment details", async () => {
    await act(async () => {
      render(
        <PaymentSuccessModal
          result={mockResult}
          countdown={900}
          onComplete={vi.fn()}
        />
      );
    });

    expect(screen.getByText("支付成功")).toBeInTheDocument();
    expect(screen.getByText("沪A·88888")).toBeInTheDocument();
    expect(screen.getByText("¥40.00")).toBeInTheDocument();
    expect(screen.getByText("微信支付")).toBeInTheDocument();
  });

  it("shows countdown timer", async () => {
    await act(async () => {
      render(
        <PaymentSuccessModal
          result={mockResult}
          countdown={540}
          onComplete={vi.fn()}
        />
      );
    });

    expect(screen.getByText(/09:00/)).toBeInTheDocument();
  });

  it("calls onComplete when complete button clicked", async () => {
    const onComplete = vi.fn();
    await act(async () => {
      render(
        <PaymentSuccessModal
          result={mockResult}
          countdown={900}
          onComplete={onComplete}
        />
      );
    });
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText("完成"));
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("shows alipay as payment method", async () => {
    await act(async () => {
      render(
        <PaymentSuccessModal
          result={{ ...mockResult, method: "alipay" }}
          countdown={900}
          onComplete={vi.fn()}
        />
      );
    });

    expect(screen.getByText("支付宝")).toBeInTheDocument();
  });
});
