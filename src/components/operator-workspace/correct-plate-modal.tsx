"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { OperatorException } from "@/types";

interface CorrectPlateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { plateNumber: string; vehicleType: "temporary" | "monthly"; exceptionId?: string }) => void;
  loading: boolean;
  exceptions: OperatorException[];
}

export function CorrectPlateModal({ open, onClose, onSubmit, loading, exceptions }: CorrectPlateModalProps) {
  const [exceptionId, setExceptionId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"temporary" | "monthly">("temporary");

  const recognitionExceptions = exceptions.filter((e) => e.type === "recognition_failed");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ plateNumber, vehicleType, exceptionId: exceptionId || undefined });
  };

  const handleClose = () => {
    setExceptionId("");
    setPlateNumber("");
    setVehicleType("temporary");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="车牌补录"
      footer={
        <>
          <button onClick={handleClose} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !plateNumber}
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {loading ? "处理中..." : "确认补录"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">关联异常记录</label>
          <select
            value={exceptionId}
            onChange={(e) => setExceptionId(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white"
          >
            <option value="">选择异常记录（可选）</option>
            {recognitionExceptions.map((exc) => {
              const d = new Date(exc.time);
              const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <option key={exc.id} value={exc.id}>
                  {exc.plateNumber} - {exc.parkingLotName} {exc.laneName} {timeStr}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">正确车牌号 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="如：沪A·88888"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-mono text-lg text-center"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">车辆类型</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVehicleType("temporary")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                vehicleType === "temporary" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`text-sm ${vehicleType === "temporary" ? "text-brand-700" : "text-gray-600"}`}>临时车</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("monthly")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                vehicleType === "monthly" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`text-sm ${vehicleType === "monthly" ? "text-brand-700" : "text-gray-600"}`}>月卡车</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
