"use client";

import type { ParkingLotOccupancy } from "@/types";

interface OccupancyPanelProps {
  occupancies: ParkingLotOccupancy[];
}

function getBarColor(usageRate: number): string {
  if (usageRate >= 90) return "bg-red-500";
  if (usageRate >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getTextColor(usageRate: number): string {
  if (usageRate >= 90) return "text-red-600";
  if (usageRate >= 70) return "text-amber-600";
  return "text-emerald-600";
}

function getStatusLabel(usageRate: number): { text: string; className: string } | null {
  if (usageRate >= 90) return { text: "车位紧张", className: "text-xs text-red-500 font-medium" };
  return null;
}

const lotIcons = [
  { bg: "bg-blue-500", icon: "building" },
  { bg: "bg-emerald-500", icon: "shop" },
  { bg: "bg-violet-500", icon: "house" },
];

export function OccupancyPanel({ occupancies }: OccupancyPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border">
        <span className="text-sm font-medium text-gray-900">车场余位状态</span>
      </div>
      <div className="p-4 space-y-4">
        {occupancies.map((lot, i) => {
          const status = getStatusLabel(lot.usageRate);
          const icon = lotIcons[i % lotIcons.length];
          return (
            <div
              key={lot.parkingLotId}
              className={`p-4 rounded-xl ${
                lot.usageRate >= 90 ? "bg-red-50 border border-red-100" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${icon.bg} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{lot.parkingLotName}</span>
                </div>
                {status ? (
                  <span className={status.className}>{status.text}</span>
                ) : (
                  <span className="text-xs text-gray-500">{lot.totalSpots}车位</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(lot.usageRate)} rounded-full transition-all duration-500`}
                    style={{ width: `${lot.usageRate}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${getTextColor(lot.usageRate)} w-16 text-right`}>
                  {lot.availableSpots} 余
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
