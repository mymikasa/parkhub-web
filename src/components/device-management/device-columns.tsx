"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "@/types";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  integrated: "一体机",
  camera_only: "仅摄像头",
  barrier_only: "仅道闸",
};

function formatHeartbeat(heartbeat: string | null): string {
  if (!heartbeat) return "-";
  const d = new Date(heartbeat);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  return d.toLocaleDateString("zh-CN");
}

export function getDeviceColumns(opts: {
  onRemoteControl: (device: Device) => void;
}): ColumnDef<Device, unknown>[] {
  return [
    {
      accessorKey: "serialNumber",
      header: "设备信息",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-mono font-medium text-gray-900">{d.serialNumber}</div>
              <div className="text-xs text-gray-500">{typeLabels[d.type] ?? d.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "parkingLotName",
      header: "所属车场/出入口",
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">{row.original.parkingLotName}</div>
          <div className="text-xs text-gray-500">
            {row.original.laneName} · {row.original.laneType === "entry" ? "入口" : "出口"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const isOnline = row.original.status === "online";
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
            isOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
            {isOnline ? "在线" : "离线"}
          </span>
        );
      },
    },
    {
      accessorKey: "lastHeartbeat",
      header: "最后心跳",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatHeartbeat(row.original.lastHeartbeat)}
        </span>
      ),
    },
    {
      accessorKey: "todayTraffic",
      header: "今日通行",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.todayTraffic ?? 0}
        </span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const device = row.original;
        return (
          <button
            onClick={() => opts.onRemoteControl(device)}
            disabled={device.status === "offline"}
            className={cn(
              "text-xs font-medium",
              device.status === "offline"
                ? "text-gray-400 cursor-not-allowed"
                : "text-brand-600 hover:text-brand-700"
            )}
          >
            远程控制
          </button>
        );
      },
    },
  ];
}
