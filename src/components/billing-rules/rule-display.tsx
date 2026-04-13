"use client";

import type { BillingRule } from "@/types";

interface RuleDisplayProps {
  rule: BillingRule | null;
  hasNoRule?: boolean;
}

export function RuleDisplay({ rule, hasNoRule }: RuleDisplayProps) {
  if (hasNoRule || !rule) {
    return (
      <div className="bg-white rounded-xl border border-surface-border p-8 text-center">
        <p className="text-sm text-gray-500">该停车场暂无计费规则</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-900">计费规则</span>
          <span className="ml-2 text-xs text-gray-500">{rule.parkingLotName}</span>
        </div>
        {rule.enabled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已启用
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{rule.freeDurationMinutes}</p>
            <p className="text-xs text-gray-500 mt-1">分钟</p>
            <p className="text-xs text-gray-400 mt-2">停车不超过{rule.freeDurationMinutes}分钟免费</p>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              <span className="text-lg">¥</span>{rule.unitPrice}
            </p>
            <p className="text-xs text-gray-500 mt-1">/{rule.billingCycle === "hourly" ? "小时" : "半小时"}</p>
            <p className="text-xs text-gray-400 mt-2">不足1{rule.billingCycle === "hourly" ? "小时" : "半小时"}按1{rule.billingCycle === "hourly" ? "小时" : "半小时"}计算</p>
          </div>

          <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {rule.dailyCap !== null ? (
                <><span className="text-lg">¥</span>{rule.dailyCap}</>
              ) : (
                <span className="text-lg text-gray-400">不限</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">每日封顶</p>
            <p className="text-xs text-gray-400 mt-2">
              {rule.dailyCap !== null ? `24小时内最高收费${rule.dailyCap}元` : "24小时计费无上限"}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">计费规则说明</p>
              <div className="mt-1 space-y-1 text-xs text-gray-500">
                <p>• 停车{rule.freeDurationMinutes}分钟内免费出场</p>
                <p>• 超过{rule.freeDurationMinutes}分钟后，从入场时间开始计费，每{rule.billingCycle === "hourly" ? "小时" : "半小时"}{rule.unitPrice}元</p>
                <p>• 不足1{rule.billingCycle === "hourly" ? "小时" : "半小时"}按1{rule.billingCycle === "hourly" ? "小时" : "半小时"}计算（向上取整）</p>
                <p>• {rule.dailyCap !== null ? `每24小时封顶${rule.dailyCap}元，超过24小时重新计费` : "无每日封顶限制"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
