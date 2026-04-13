import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { StatCard } from "@/components/shared/stat-card";

describe("StatCard", () => {
  it("renders label and value", async () => {
    await act(async () => {
      render(
        <StatCard
          label="总车位数"
          value={8640}
          icon={<span data-testid="icon">icon</span>}
        />
      );
    });
    expect(screen.getByText("总车位数")).toBeInTheDocument();
    expect(screen.getByText("8,640")).toBeInTheDocument();
  });

  it("renders string value", async () => {
    await act(async () => {
      render(
        <StatCard label="状态" value="正常" icon={<span>icon</span>} />
      );
    });
    expect(screen.getByText("正常")).toBeInTheDocument();
  });

  it("applies custom color classes", async () => {
    const { container } = render(
      <StatCard
        label="剩余车位"
        value={100}
        icon={<span>icon</span>}
        valueColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        iconTextClass="text-emerald-600"
      />
    );
    await act(async () => {});
    const valueEl = container.querySelector(".text-emerald-600");
    expect(valueEl).toBeInTheDocument();
  });

  it("renders icon", async () => {
    await act(async () => {
      render(
        <StatCard
          label="测试"
          value={42}
          icon={<span data-testid="test-icon">X</span>}
        />
      );
    });
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies className", async () => {
    const { container } = render(
      <StatCard
        label="测试"
        value={42}
        icon={<span>icon</span>}
        className="custom-class"
      />
    );
    await act(async () => {});
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
