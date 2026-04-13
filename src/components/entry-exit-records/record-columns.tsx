"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { EntryExitRecord } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  normal: { label: "正常", variant: "success" },
  paid: { label: "已缴费", variant: "success" },
  entry_no_exit: { label: "有入无出", variant: "warning" },
  exit_no_entry: { label: "有出无入", variant: "warning" },
  recognition_failed: { label: "识别失败", variant: "error" },
};

const typeMap: Record<string, { label: string; variant: "success" | "default" }> = {
  entry: { label: "入场", variant: "default" },
  exit: { label: "出场", variant: "success" },
};

export function getRecordColumns(opts: {
  onViewDetail: (record: EntryExitRecord) => void;
  onHandleException: (record: EntryExitRecord) => void;
}): ColumnDef<EntryExitRecord, unknown>[] {
  return [
    {
      accessorKey: "time",
      header: "时间",
      cell: ({ row }) => {
        const time = new Date(row.original.time);
        return (
          <div>
            <div className="text-sm text-gray-900">{time.toLocaleDateString("zh-CN")}</div>
            <div className="text-xs text-gray-500">{time.toLocaleTimeString("zh-CN")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "plateNumber",
      header: "车牌号",
      cell: ({ row }) => {
        const isException = ["entry_no_exit", "exit_no_entry", "recognition_failed"].includes(
          row.original.status
        );
        return (
          <span
            className={`font-mono text-sm ${isException ? "text-red-600 font-semibold" : "text-gray-900"}`}
          >
            {row.original.plateNumber}
          </span>
        );
      },
    },
    {
      accessorKey: "parkingLotName",
      header: "车场",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.parkingLotName}</span>
      ),
    },
    {
      accessorKey: "laneName",
      header: "出入口",
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => {
        const t = typeMap[row.original.type];
        return <StatusBadge variant={t?.variant ?? "default"}>{t?.label ?? row.original.type}</StatusBadge>;
      },
    },
    {
      accessorKey: "fee",
      header: "费用",
      cell: ({ row }) =>
        row.original.fee != null ? (
          <span className="text-sm font-medium text-gray-900">&yen;{row.original.fee.toFixed(2)}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const s = statusMap[row.original.status];
        return <StatusBadge variant={s?.variant ?? "default"}>{s?.label ?? row.original.status}</StatusBadge>;
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const record = row.original;
        const isException = ["entry_no_exit", "exit_no_entry", "recognition_failed"].includes(
          record.status
        );
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => opts.onViewDetail(record)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              详情
            </button>
            {isException && (
              <button
                onClick={() => opts.onHandleException(record)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                处理
              </button>
            )}
          </div>
        );
      },
    },
  ];
}
