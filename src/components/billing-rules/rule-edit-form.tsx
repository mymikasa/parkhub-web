"use client";

import { useState, useEffect } from "react";
import type { BillingRule, BillingCycle } from "@/types";

interface RuleEditFormProps {
  rule: BillingRule | null;
  onSave: (data: {
    freeDurationMinutes: number;
    unitPrice: number;
    dailyCap: number | null;
    billingCycle: BillingCycle;
  }) => void;
  saving: boolean;
}

export function RuleEditForm({ rule, onSave, saving }: RuleEditFormProps) {
  const [freeDuration, setFreeDuration] = useState(15);
  const [unitPrice, setUnitPrice] = useState(8);
  const [dailyCap, setDailyCap] = useState(64);
  const [noLimit, setNoLimit] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("hourly");

  useEffect(() => {
    if (rule) {
      setFreeDuration(rule.freeDurationMinutes);
      setUnitPrice(rule.unitPrice);
      setDailyCap(rule.dailyCap ?? 0);
      setNoLimit(rule.dailyCap === null);
      setBillingCycle(rule.billingCycle);
    }
  }, [rule]);

  const handleReset = () => {
    if (rule) {
      setFreeDuration(rule.freeDurationMinutes);
      setUnitPrice(rule.unitPrice);
      setDailyCap(rule.dailyCap ?? 0);
      setNoLimit(rule.dailyCap === null);
      setBillingCycle(rule.billingCycle);
    }
  };

  const handleSave = () => {
    onSave({
      freeDurationMinutes: freeDuration,
      unitPrice,
      dailyCap: noLimit ? null : dailyCap,
      billingCycle,
    });
  };

  if (!rule) return null;

  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border">
        <span className="text-sm font-medium text-gray-900">修改规则</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">免费时长</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={120}
                value={freeDuration}
                onChange={(e) => setFreeDuration(Number(e.target.value))}
                className="w-20 h-9 px-3 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />
              <span className="text-sm text-gray-500">分钟</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            value={freeDuration}
            onChange={(e) => setFreeDuration(Number(e.target.value))}
            className="billing-slider w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0分钟</span>
            <span>60分钟</span>
            <span>120分钟</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">计费单价</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">¥</span>
              <input
                type="number"
                min={1}
                max={50}
                step={0.5}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-20 h-9 px-3 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />
              <span className="text-sm text-gray-500">/小时</span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="billing-slider w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>¥1</span>
            <span>¥25</span>
            <span>¥50</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">每日封顶</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">¥</span>
              <input
                type="number"
                min={0}
                max={500}
                step={4}
                value={dailyCap}
                disabled={noLimit}
                onChange={(e) => setDailyCap(Number(e.target.value))}
                className="w-20 h-9 px-3 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={4}
            value={dailyCap}
            disabled={noLimit}
            onChange={(e) => setDailyCap(Number(e.target.value))}
            className="billing-slider w-full disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>¥0</span>
            <span>¥250</span>
            <span>¥500</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
            <input
              type="checkbox"
              id="no-limit"
              checked={noLimit}
              onChange={(e) => setNoLimit(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="no-limit" className="text-sm text-gray-700">
              不设封顶（24小时计费无上限）
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">计费周期</label>
          <div className="flex gap-3">
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                billingCycle === "hourly"
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="billingCycle"
                value="hourly"
                checked={billingCycle === "hourly"}
                onChange={() => setBillingCycle("hourly")}
                className="sr-only"
              />
              <svg className={`w-4 h-4 ${billingCycle === "hourly" ? "text-brand-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium ${billingCycle === "hourly" ? "text-brand-700" : "text-gray-600"}`}>
                按小时计费
              </span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                billingCycle === "half_hourly"
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="billingCycle"
                value="half_hourly"
                checked={billingCycle === "half_hourly"}
                onChange={() => setBillingCycle("half_hourly")}
                className="sr-only"
              />
              <svg className={`w-4 h-4 ${billingCycle === "half_hourly" ? "text-brand-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium ${billingCycle === "half_hourly" ? "text-brand-700" : "text-gray-600"}`}>
                按半小时计费
              </span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "保存中..." : "保存规则"}
          </button>
        </div>
      </div>
    </div>
  );
}
