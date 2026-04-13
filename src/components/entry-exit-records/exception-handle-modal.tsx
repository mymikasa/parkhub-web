"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { EntryExitRecord } from "@/types";

const exceptionLabels: Record<string, string> = {
  entry_no_exit: "有入无出",
  exit_no_entry: "有出无入",
  recognition_failed: "识别失败",
};

interface ExceptionHandleModalProps {
  open: boolean;
  onClose: () => void;
  record: EntryExitRecord | null;
  onSubmit: (plateNumber: string, remark: string) => void;
  loading?: boolean;
}

export function ExceptionHandleModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: ExceptionHandleModalProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [remark, setRemark] = useState("");

  const handleSubmit = () => {
    if (!plateNumber.trim()) return;
    onSubmit(plateNumber.trim(), remark.trim());
  };

  const handleClose = () => {
    setPlateNumber("");
    setRemark("");
    onClose();
  };

  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="处理异常记录"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!plateNumber.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "处理中..." : "确认处理"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-sm text-amber-800">
            异常类型：<span className="font-medium">{exceptionLabels[record.status] ?? record.status}</span>
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            原车牌号：{record.plateNumber} | {record.parkingLotName} · {record.laneName}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            正确车牌号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="请输入正确的车牌号"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="可选，填写处理说明"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
