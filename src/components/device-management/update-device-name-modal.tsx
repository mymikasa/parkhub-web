"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/modal";

interface UpdateDeviceNameModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  deviceName: string;
  loading?: boolean;
}

export function UpdateDeviceNameModal({ open, onClose, onSubmit, deviceName, loading = false }: UpdateDeviceNameModalProps) {
  const [name, setName] = useState(deviceName);

  useEffect(() => {
    if (open) setName(deviceName);
  }, [open, deviceName]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="修改设备名称"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          设备名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入设备名称"
          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
        />
      </div>
    </Modal>
  );
}
