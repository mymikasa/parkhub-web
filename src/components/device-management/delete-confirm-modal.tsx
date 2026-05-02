"use client";

import { Modal } from "@/components/shared/modal";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deviceId: string;
  loading?: boolean;
}

export function DeleteConfirmModal({ open, onClose, onConfirm, deviceId, loading = false }: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="删除设备"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "删除中..." : "确认删除"}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        确定要删除设备 <span className="font-mono font-medium text-gray-900">{deviceId}</span> 吗？已绑定的设备需先解绑才能删除。
      </p>
    </Modal>
  );
}
