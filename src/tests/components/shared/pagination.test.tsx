import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Pagination } from "@/components/shared/pagination";

describe("Pagination", () => {
  it("renders nothing when totalPages <= 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders correct page buttons", async () => {
    await act(async () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
      );
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("highlights current page", async () => {
    await act(async () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
      );
    });
    const currentBtn = screen.getByText("2");
    expect(currentBtn).toHaveClass("bg-brand-600");
  });

  it("calls onPageChange when page clicked", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByText("3"));
    });
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables prev button on first page", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
      );
    });
    const buttons = screen.getAllByRole("button");
    const prevBtn = buttons[0];
    expect(prevBtn).toBeDisabled();
  });

  it("disables next button on last page", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />
      );
    });
    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn).toBeDisabled();
  });

  it("shows ellipsis for large page counts", async () => {
    await act(async () => {
      render(
        <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />
      );
    });
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it("calls onPageChange with prev/next page", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
      );
    });
    const buttons = screen.getAllByRole("button");
    const prevBtn = buttons[0];
    const nextBtn = buttons[buttons.length - 1];
    await act(async () => {
      fireEvent.click(prevBtn);
    });
    expect(onPageChange).toHaveBeenCalledWith(2);
    await act(async () => {
      fireEvent.click(nextBtn);
    });
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
