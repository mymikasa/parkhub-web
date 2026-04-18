"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { DeviceType } from "@/types";

interface CreateDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id: string; name?: string; type: DeviceType; firmwareVersion?: string }) => void;
  loading?: boolean;
}

const deviceTypeOptions: { value: DeviceType; label: string }[] = [
  { value: "integrated", label: "一体机" },
  { value: "camera_only", label: "仅摄像头" },
  { value: "barrier_only", label: "仅道闸" },
];

export function CreateDeviceModal({ open, onClose, onSubmit, loading = false }: CreateDeviceModalProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("integrated");
  const [firmwareVersion, setFirmwareVersion] = useState("");

  const handleSubmit = () => {
    if (!id.trim()) return;
    onSubmit({
      id: id.trim(),
      name: name.trim() || undefined,
      type: deviceType,
      firmwareVersion: firmwareVersion.trim() || undefined,
    });
  };

  const handleClose = () => {
    setId("");
    setName("");
    setDeviceType("integrated");
    setFirmwareVersion("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="注册新设备"
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
            disabled={!id.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "注册中..." : "确认注册"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            设备ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="请输入设备序列号/ID"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入设备名称（可选）"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            设备类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            {deviceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">固件版本</label>
          <input
            type="text"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.target.value)}
            placeholder="请输入固件版本（可选）"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
      </div>
    </Modal>
  );
}
