"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { ParkingLot } from "@/types";

interface BindDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { parkingLotId: string; gateId: string }) => void;
  parkingLots: ParkingLot[];
  loading?: boolean;
}

export function BindDeviceModal({ open, onClose, onSubmit, parkingLots, loading = false }: BindDeviceModalProps) {
  const [parkingLotId, setParkingLotId] = useState("");
  const [gateId, setGateId] = useState("");

  const handleSubmit = () => {
    if (!parkingLotId || !gateId.trim()) return;
    onSubmit({ parkingLotId, gateId: gateId.trim() });
  };

  const handleClose = () => {
    setParkingLotId("");
    setGateId("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="绑定设备"
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
            disabled={!parkingLotId || !gateId.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "绑定中..." : "确认绑定"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            停车场 <span className="text-red-500">*</span>
          </label>
          <select
            value={parkingLotId}
            onChange={(e) => { setParkingLotId(e.target.value); setGateId(""); }}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">请选择停车场</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>{lot.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            道闸ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gateId}
            onChange={(e) => setGateId(e.target.value)}
            placeholder="请输入道闸ID"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
      </div>
    </Modal>
  );
}
