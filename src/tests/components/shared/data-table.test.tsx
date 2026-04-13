import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock @tanstack/react-table to avoid React 19 dual-instance hook issue in vitest
vi.mock("@tanstack/react-table", () => {
  return {
    useReactTable: vi.fn(({ data, columns }) => ({
      getHeaderGroups: () => [
        {
          id: "header-0",
          headers: columns.map((col: Record<string, unknown>, i: number) => ({
            id: `header_${i}`,
            isPlaceholder: false,
            getSize: () => 150,
            column: { columnDef: col },
            getContext: () => ({ column: { columnDef: col }, header: {} }),
          })),
        },
      ],
      getRowModel: () => ({
        rows: data.map((item: Record<string, unknown>, i: number) => ({
          id: `row_${i}`,
          original: item,
          getVisibleCells: () =>
            columns.map((col: Record<string, unknown>, j: number) => ({
              id: `cell_${i}_${j}`,
              column: { columnDef: col },
              getContext: () => ({
                row: { original: item },
                column: { columnDef: col },
                getValue: () =>
                  (item as Record<string, unknown>)[col.accessorKey as string],
              }),
            })),
        })),
      }),
    })),
    getCoreRowModel: vi.fn(() => vi.fn()),
    flexRender: vi.fn((content: unknown, context: Record<string, unknown>) => {
      if (typeof content === "function") return content(context);
      if (typeof content === "string") return content;
      return null;
    }),
  };
});

import { DataTable } from "@/components/shared/data-table";
import { type ColumnDef } from "@tanstack/react-table";

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "value", header: "数值" },
];

const mockData: TestRow[] = [
  { id: "1", name: "项目A", value: 100 },
  { id: "2", name: "项目B", value: 200 },
  { id: "3", name: "项目C", value: 300 },
];

describe("DataTable", () => {
  it("renders column headers", async () => {
    await act(async () => {
      render(<DataTable columns={columns} data={mockData} />);
    });
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("名称")).toBeInTheDocument();
    expect(screen.getByText("数值")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", async () => {
    await act(async () => {
      render(<DataTable columns={columns} data={[]} emptyMessage="没有数据" />);
    });
    expect(screen.getByText("没有数据")).toBeInTheDocument();
  });

  it("renders default empty message", async () => {
    await act(async () => {
      render(<DataTable columns={columns} data={[]} />);
    });
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });

  it("renders loading overlay when loading", async () => {
    await act(async () => {
      render(<DataTable columns={columns} data={mockData} loading />);
    });
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders pagination with info text", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          pagination={{ page: 1, pageSize: 10, total: 30, onPageChange }}
        />
      );
    });
    expect(screen.getByText("显示 1-10 条，共 30 条")).toBeInTheDocument();
  });

  it("calls onPageChange when pagination button clicked", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          pagination={{ page: 1, pageSize: 10, total: 30, onPageChange }}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByText("2"));
    });
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("applies custom row class name via getRowClassName", async () => {
    const { container } = await act(async () => {
      return render(
        <DataTable
          columns={columns}
          data={mockData}
          getRowClassName={(row) => (row.value > 200 ? "highlight-row" : "")}
        />
      );
    });
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(3);
    // Third row (value=300) should have highlight-row
    expect(rows[2].className).toContain("highlight-row");
    // First row (value=100) should not
    expect(rows[0].className).not.toContain("highlight-row");
  });
});
