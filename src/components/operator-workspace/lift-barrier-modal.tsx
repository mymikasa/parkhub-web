"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { OperatorException } from "@/types";

interface LiftBarrierModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { parkingLotId: string; laneId: string; reason: string }) => void;
  loading: boolean;
  exceptions: OperatorException[];
}

export function LiftBarrierModal({ open, onClose, onSubmit, loading, exceptions }: LiftBarrierModalProps) {
  const [parkingLotId, setParkingLotId] = useState("");
  const [laneId, setLaneId] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ parkingLotId, laneId, reason });
  };

  const handleClose = () => {
    setParkingLotId("");
    setLaneId("");
    setReason("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="手动抬杆"
      footer={
        <>
          <button onClick={handleClose} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !parkingLotId || !laneId}
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium flex items-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {loading ? "执行中..." : "确认抬杆"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">选择停车场 <span className="text-red-500">*</span></label>
          <select
            value={parkingLotId}
            onChange={(e) => setParkingLotId(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white"
          >
            <option value="">请选择</option>
            <option value="lot_001">万科翡翠滨江</option>
            <option value="lot_002">万科广场</option>
            <option value="lot_003">万科城市花园</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">选择出入口 <span className="text-red-500">*</span></label>
          <select
            value={laneId}
            onChange={(e) => setLaneId(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white"
          >
            <option value="">请选择</option>
            <option value="lane_001">1号入口</option>
            <option value="lane_002">2号入口</option>
            <option value="lane_004">1号出口</option>
            <option value="lane_005">2号出口</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">操作原因</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="选填"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
