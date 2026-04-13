"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { BillingLotOption, CalculateFeeResult } from "@/types";

interface CalculatorModalProps {
  open: boolean;
  onClose: () => void;
  lots: BillingLotOption[];
}

export function CalculatorModal({ open, onClose, lots }: CalculatorModalProps) {
  const [parkingLotId, setParkingLotId] = useState(lots[0]?.id ?? "");
  const [entryTime, setEntryTime] = useState("2026-03-13T09:30");
  const [exitTime, setExitTime] = useState("2026-03-13T14:30");
  const [result, setResult] = useState<CalculateFeeResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!parkingLotId) return;
    setCalculating(true);
    setError("");
    try {
      const { billingService } = await import("@/lib/api/billing");
      const res = await billingService.calculate({
        parkingLotId,
        entryTime: new Date(entryTime).toISOString(),
        exitTime: new Date(exitTime).toISOString(),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "计算失败");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="费用计算器"
      maxWidth="max-w-md"
      footer={
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="h-10 px-8 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-medium hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50"
        >
          {calculating ? "计算中..." : "重新计算"}
        </button>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">停车场</label>
          <select
            value={parkingLotId}
            onChange={(e) => setParkingLotId(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">入场时间</label>
            <input
              type="datetime-local"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">出场时间</label>
            <input
              type="datetime-local"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {result && (
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">停车时长</span>
              <span className="text-lg font-semibold text-gray-900">{result.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">免费时长</span>
              <span className="text-sm text-gray-600">{result.freeDuration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">计费时长</span>
              <span className="text-sm text-gray-600">{result.billableDuration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">计费单价</span>
              <span className="text-sm text-gray-600">¥{result.unitPrice}/小时</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">应付金额</span>
              <span className="text-2xl font-bold text-brand-600">¥{result.totalFee.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
