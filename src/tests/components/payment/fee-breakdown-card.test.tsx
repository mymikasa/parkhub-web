import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeeBreakdownCard } from "@/components/payment/fee-breakdown-card";

describe("FeeBreakdownCard", () => {
  it("renders fee breakdown details", async () => {
    await act(async () => {
      render(
        <FeeBreakdownCard
          duration="5小时02分钟"
          freeDuration="15分钟"
          billableDuration="4小时47分钟 → 5小时"
          unitPrice={8}
          totalFee={40}
        />
      );
    });

    expect(screen.getByText("费用明细")).toBeInTheDocument();
    expect(screen.getByText("5小时02分钟")).toBeInTheDocument();
    expect(screen.getByText("-15分钟")).toBeInTheDocument();
    expect(screen.getByText("4小时47分钟 → 5小时")).toBeInTheDocument();
  });

  it("renders total fee with integer and decimal parts", async () => {
    await act(async () => {
      render(
        <FeeBreakdownCard
          duration="2小时00分钟"
          freeDuration="15分钟"
          billableDuration="1小时45分钟 → 2小时"
          unitPrice={10}
          totalFee={20}
        />
      );
    });

    expect(screen.getByText("¥20")).toBeInTheDocument();
    expect(screen.getByText(".00")).toBeInTheDocument();
  });

  it("renders total fee with non-zero decimal", async () => {
    await act(async () => {
      render(
        <FeeBreakdownCard
          duration="1小时00分钟"
          freeDuration="0分钟"
          billableDuration="1小时0分钟 → 1小时"
          unitPrice={7.5}
          totalFee={7.5}
        />
      );
    });

    expect(screen.getByText("¥7")).toBeInTheDocument();
    expect(screen.getByText(".50")).toBeInTheDocument();
  });

  it("renders view rule button when onViewRule provided", async () => {
    const onViewRule = vi.fn();
    await act(async () => {
      render(
        <FeeBreakdownCard
          duration="1小时00分钟"
          freeDuration="0分钟"
          billableDuration="1小时0分钟 → 1小时"
          unitPrice={8}
          totalFee={8}
          onViewRule={onViewRule}
        />
      );
    });

    const btn = screen.getByText("计费规则");
    expect(btn).toBeInTheDocument();
    const user = userEvent.setup();
    await act(async () => {
      await user.click(btn);
    });
    expect(onViewRule).toHaveBeenCalledOnce();
  });

  it("hides view rule button when onViewRule not provided", async () => {
    await act(async () => {
      render(
        <FeeBreakdownCard
          duration="1小时00分钟"
          freeDuration="0分钟"
          billableDuration="1小时0分钟 → 1小时"
          unitPrice={8}
          totalFee={8}
        />
      );
    });

    expect(screen.queryByText("计费规则")).not.toBeInTheDocument();
  });
});
