"use client";

import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import type { EntryExitRecord } from "@/types";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  normal: { label: "正常", variant: "success" },
  paid: { label: "已缴费", variant: "success" },
  entry_no_exit: { label: "有入无出", variant: "warning" },
  exit_no_entry: { label: "有出无入", variant: "warning" },
  recognition_failed: { label: "识别失败", variant: "error" },
};

interface RecordDetailModalProps {
  open: boolean;
  onClose: () => void;
  record: EntryExitRecord | null;
}

export function RecordDetailModal({ open, onClose, record }: RecordDetailModalProps) {
  if (!record) return null;

  const s = statusMap[record.status];
  const time = new Date(record.time);

  return (
    <Modal open={open} onClose={onClose} title="记录详情" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {record.imageUrl && (
          <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              抓拍图片
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">车牌号</p>
            <p className="text-sm font-mono font-medium text-gray-900">{record.plateNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">状态</p>
            <StatusBadge variant={s?.variant ?? "default"}>{s?.label ?? record.status}</StatusBadge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">停车场</p>
            <p className="text-sm text-gray-900">{record.parkingLotName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">出入口</p>
            <p className="text-sm text-gray-900">{record.laneName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">时间</p>
            <p className="text-sm text-gray-900">{time.toLocaleString("zh-CN")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">费用</p>
            <p className="text-sm text-gray-900">
              {record.fee != null ? `¥${record.fee.toFixed(2)}` : "-"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
