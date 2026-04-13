"use client";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ParkingLot } from "@/types";

interface ParkingLotCardProps {
  lot: ParkingLot;
  onEdit: (lot: ParkingLot) => void;
  onConfigureLanes: (lot: ParkingLot) => void;
}

function getUsageColor(rate: number) {
  if (rate >= 90)
    return { bar: "bg-red-500", glow: "glow-danger", text: "text-red-600" };
  if (rate >= 70)
    return {
      bar: "bg-amber-500",
      glow: "glow-warning",
      text: "text-amber-600",
    };
  return {
    bar: "bg-emerald-500",
    glow: "glow-normal",
    text: "text-emerald-600",
  };
}

const typeGradients: Record<string, string> = {
  underground: "from-blue-500 to-blue-600",
  ground: "from-emerald-500 to-emerald-600",
  mechanical: "from-violet-500 to-violet-600",
};

const typeIcons: Record<string, React.ReactNode> = {
  underground: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  ground: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  mechanical: (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
};

export function ParkingLotCard({ lot, onEdit, onConfigureLanes }: ParkingLotCardProps) {
  const usage = getUsageColor(lot.usageRate);

  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden card-hover">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                typeGradients[lot.type] || typeGradients.ground
              )}
            >
              {typeIcons[lot.type] || typeIcons.ground}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {lot.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                <svg
                  className="w-3.5 h-3.5 text-gray-400 mr-1 inline -mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {lot.address}
              </p>
            </div>
          </div>
          {lot.status === "operating" ? (
            <StatusBadge variant="success">运营中</StatusBadge>
          ) : (
            <StatusBadge variant="default">暂停运营</StatusBadge>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {lot.totalSpots.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">总车位</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {lot.availableSpots.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">剩余</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-brand-600">
              {lot.laneCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">出入口</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">使用率</span>
            <span className={cn("font-medium", usage.text)}>
              {lot.usageRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full progress-bar", usage.bar, usage.glow)}
              style={{ width: `${lot.usageRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            <svg className="w-3.5 h-3.5 text-emerald-500 mr-1 inline -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            入口 {lot.entryCount}
          </span>
          <span>
            <svg className="w-3.5 h-3.5 text-blue-500 mr-1 inline -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            出口 {lot.exitCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfigureLanes(lot)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            配置出入口
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onEdit(lot)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  );
}
