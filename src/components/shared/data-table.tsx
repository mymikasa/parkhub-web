"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Pagination } from "./pagination";

interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  loading?: boolean;
  pagination?: DataTablePagination;
  emptyMessage?: string;
  className?: string;
  getRowClassName?: (row: T) => string;
  getRowId?: (row: T) => string;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  pagination,
  emptyMessage = "暂无数据",
  className,
  getRowClassName,
  getRowId,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
}: DataTableProps<T>) {
  const handleRowSelectionChange = onRowSelectionChange
    ? (updaterOrValue: Updater<RowSelectionState>) => {
        const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
        onRowSelectionChange(next);
      }
    : undefined;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row) => getRowId(row as T) : undefined,
    enableRowSelection,
    state: enableRowSelection ? { rowSelection } : undefined,
    onRowSelectionChange: enableRowSelection ? handleRowSelectionChange : undefined,
  });

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  const showFrom = pagination
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 1;
  const showTo = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : data.length;

  return (
    <div className={cn("bg-white rounded-xl border border-surface-border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-surface-border sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {enableRowSelection && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={table.getIsAllRowsSelected()}
                      ref={(el) => {
                        if (el) {
                          const all = table.getIsAllRowsSelected();
                          const some = Object.keys(rowSelection).some((k) => rowSelection[k]);
                          el.indeterminate = !all && some;
                        }
                      }}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="relative divide-y divide-surface-border">
            {loading && (
              <tr>
                <td colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="p-0">
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-5 h-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>加载中...</span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    enableRowSelection && row.getIsSelected() && "bg-brand-50/30",
                    getRowClassName?.(row.original)
                  )}
                >
                  {enableRowSelection && (
                    <td className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="px-4 py-3 border-t border-surface-border flex items-center justify-between">
          <p className="text-sm text-gray-500">
            显示 {showFrom}-{showTo} 条，共 {pagination.total} 条
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
