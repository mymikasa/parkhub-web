"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "@/types";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  integrated: "一体机",
  camera_only: "仅摄像头",
  barrier_only: "仅道闸",
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "待激活", bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" },
  active: { label: "在线", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500 animate-pulse" },
  offline: { label: "离线", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  disabled: { label: "已停用", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
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
  onEdit: (device: Device) => void;
  onBind: (device: Device) => void;
  onUnbind: (device: Device) => void;
  onDisable: (device: Device) => void;
  onEnable: (device: Device) => void;
  onDelete: (device: Device) => void;
  onRemoteControl: (device: Device) => void;
}): ColumnDef<Device, unknown>[] {
  return [
    {
      accessorKey: "id",
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
              <div className="text-sm font-mono font-medium text-gray-900">{d.id}</div>
              <div className="text-xs text-gray-500">
                {d.name || "-"} · {typeLabels[d.type] ?? d.type}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "binding",
      header: "绑定信息",
      cell: ({ row }) => {
        const d = row.original;
        if (!d.parkingLotId) {
          return <span className="text-xs text-gray-400">未绑定</span>;
        }
        return (
          <div>
            <div className="text-sm text-gray-900">车场: {d.parkingLotId}</div>
            {d.gateId && <div className="text-xs text-gray-500">道闸: {d.gateId}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] ?? statusConfig.pending;
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
            cfg.bg, cfg.text,
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      accessorKey: "firmwareVersion",
      header: "固件版本",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.firmwareVersion || "-"}</span>
      ),
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
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => opts.onEdit(d)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              编辑
            </button>
            {d.status === "pending" && (
              <>
                <button onClick={() => opts.onBind(d)} className="text-xs font-medium text-blue-600 hover:text-blue-700">绑定</button>
                <button onClick={() => opts.onDisable(d)} className="text-xs font-medium text-orange-600 hover:text-orange-700">停用</button>
                <button onClick={() => opts.onDelete(d)} className="text-xs font-medium text-red-600 hover:text-red-700">删除</button>
              </>
            )}
            {d.status === "active" && (
              <>
                <button onClick={() => opts.onUnbind(d)} className="text-xs font-medium text-gray-600 hover:text-gray-700">解绑</button>
                <button onClick={() => opts.onDisable(d)} className="text-xs font-medium text-orange-600 hover:text-orange-700">停用</button>
                <button onClick={() => opts.onRemoteControl(d)} className="text-xs font-medium text-brand-600 hover:text-brand-700">远程控制</button>
              </>
            )}
            {d.status === "offline" && (
              <>
                <button onClick={() => opts.onUnbind(d)} className="text-xs font-medium text-gray-600 hover:text-gray-700">解绑</button>
                <button onClick={() => opts.onDisable(d)} className="text-xs font-medium text-orange-600 hover:text-orange-700">停用</button>
                <button onClick={() => opts.onDelete(d)} className="text-xs font-medium text-red-600 hover:text-red-700">删除</button>
              </>
            )}
            {d.status === "disabled" && (
              <button onClick={() => opts.onEnable(d)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">启用</button>
            )}
          </div>
        );
      },
    },
  ];
}
