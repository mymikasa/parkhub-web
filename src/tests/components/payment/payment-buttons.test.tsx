import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentButtons } from "@/components/payment/payment-buttons";

describe("PaymentButtons", () => {
  it("renders both payment buttons", async () => {
    await act(async () => {
      render(<PaymentButtons loading={false} onPay={vi.fn()} />);
    });
    expect(screen.getByText("微信支付")).toBeInTheDocument();
    expect(screen.getByText("支付宝")).toBeInTheDocument();
  });

  it("calls onPay with wechat when wechat button clicked", async () => {
    const onPay = vi.fn();
    await act(async () => {
      render(<PaymentButtons loading={false} onPay={onPay} />);
    });
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText("微信支付"));
    });
    expect(onPay).toHaveBeenCalledWith("wechat");
  });

  it("calls onPay with alipay when alipay button clicked", async () => {
    const onPay = vi.fn();
    await act(async () => {
      render(<PaymentButtons loading={false} onPay={onPay} />);
    });
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText("支付宝"));
    });
    expect(onPay).toHaveBeenCalledWith("alipay");
  });

  it("disables buttons when loading", async () => {
    const onPay = vi.fn();
    await act(async () => {
      render(<PaymentButtons loading={true} onPay={onPay} />);
    });

    const wechatBtn = screen.getByText("微信支付").closest("button");
    const alipayBtn = screen.getByText("支付宝").closest("button");
    expect(wechatBtn).toBeDisabled();
    expect(alipayBtn).toBeDisabled();
  });
});
