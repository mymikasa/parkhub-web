"use client";

import type { LongParkAlert } from "@/types";

interface LongParkAlertsProps {
  alerts: LongParkAlert[];
}

function formatEntryTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LongParkAlerts({ alerts }: LongParkAlertsProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">长时间停放预警</span>
        <span className="text-xs text-amber-600 font-medium">{alerts.length} 辆</span>
      </div>
      <div className="divide-y divide-gray-100">
        {alerts.map((alert) => (
          <div key={alert.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div>
              <span className="font-mono font-bold text-sm text-gray-900">{alert.plateNumber}</span>
              <div className="text-xs text-gray-500 mt-0.5">入场: {formatEntryTime(alert.entryTime)}</div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${alert.level === "critical" ? "text-red-600" : "text-amber-600"}`}>
                {alert.duration}
              </span>
              <div className="text-xs text-gray-400">{alert.parkingLotName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
