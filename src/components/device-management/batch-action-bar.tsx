"use client";

import type { Device } from "@/types";

interface BatchActionBarProps {
  selectedDevices: Device[];
  onBatchDisable: (ids: string[]) => void;
  onBatchEnable: (ids: string[]) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchBind: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export function BatchActionBar({
  selectedDevices,
  onBatchDisable,
  onBatchEnable,
  onBatchDelete,
  onBatchBind,
  onClearSelection,
  loading = false,
}: BatchActionBarProps) {
  if (selectedDevices.length === 0) return null;

  const ids = selectedDevices.map((d) => d.id);
  const hasPending = selectedDevices.some((d) => d.status === "pending");
  const hasDisablable = selectedDevices.some((d) => d.status !== "disabled");
  const hasDisabled = selectedDevices.some((d) => d.status === "disabled");
  const hasDeletable = selectedDevices.some(
    (d) => d.status === "pending" || d.status === "offline",
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-900 rounded-2xl shadow-2xl">
        <span className="text-sm font-medium text-white">
          已选择 <span className="text-brand-400">{selectedDevices.length}</span> 台设备
        </span>

        <div className="w-px h-5 bg-gray-700" />

        {hasPending && (
          <button
            onClick={onBatchBind}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
          >
            批量绑定
          </button>
        )}

        {hasDisablable && (
          <button
            onClick={() => onBatchDisable(ids)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 disabled:opacity-50 transition-colors"
          >
            批量停用
          </button>
        )}

        {hasDisabled && (
          <button
            onClick={() => onBatchEnable(ids)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            批量启用
          </button>
        )}

        {hasDeletable && (
          <button
            onClick={() => onBatchDelete(ids)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            批量删除
          </button>
        )}

        <div className="w-px h-5 bg-gray-700" />

        <button
          onClick={onClearSelection}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          取消选择
        </button>
      </div>
    </div>
  );
}
