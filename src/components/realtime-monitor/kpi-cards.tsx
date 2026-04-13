"use client";

import { cn } from "@/lib/utils";
import type { MonitorKPI } from "@/types";

interface KpiCardsProps {
  kpi: MonitorKPI;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function KpiCards({ kpi }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="bg-white rounded-xl p-5 border border-surface-border card-hover ring-2 ring-emerald-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">今日入场</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1 tabular-nums">{formatNumber(kpi.todayEntries)}</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+{kpi.entryChangeRate}%</span>
          <span className="text-gray-400">较昨日同时段</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-surface-border card-hover ring-2 ring-blue-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">今日出场</p>
            <p className="text-3xl font-bold text-blue-600 mt-1 tabular-nums">{formatNumber(kpi.todayExits)}</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">+{kpi.exitChangeRate}%</span>
          <span className="text-gray-400">较昨日同时段</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-surface-border card-hover ring-2 ring-amber-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">在场车辆</p>
            <p className="text-3xl font-bold text-amber-600 mt-1 tabular-nums">{formatNumber(kpi.currentVehicles)}</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h4m-2 8H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v7" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className="text-gray-400">总车位 {formatNumber(kpi.totalSpots)} · 使用率</span>
          <span className="text-amber-600 font-medium">{kpi.usageRate}%</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-surface-border card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">今日收入</p>
            <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">¥{formatNumber(kpi.todayRevenue)}</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded">+{kpi.revenueChangeRate}%</span>
          <span className="text-gray-400">较昨日同时段</span>
        </div>
      </div>
    </div>
  );
}
