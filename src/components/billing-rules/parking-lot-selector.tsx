"use client";

import { cn } from "@/lib/utils";
import type { BillingLotOption, ParkingLotStatus } from "@/types";

interface ParkingLotSelectorProps {
  lots: BillingLotOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const lotIcons: Record<string, { icon: string; gradient: string }> = {
  default: { icon: "building", gradient: "from-blue-500 to-blue-600" },
};

export function ParkingLotSelector({ lots, selectedId, onSelect }: ParkingLotSelectorProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border">
        <span className="text-sm font-medium text-gray-900">选择停车场</span>
      </div>
      <div className="p-3 space-y-2">
        {lots.map((lot) => {
          const isActive = lot.id === selectedId;
          const isSuspended = lot.status === "suspended";
          return (
            <div
              key={lot.id}
              onClick={() => !isSuspended && onSelect(lot.id)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                isActive
                  ? "border-brand-500 bg-white"
                  : isSuspended
                    ? "border-surface-border opacity-60 cursor-not-allowed"
                    : "border-surface-border hover:border-gray-300"
              )}
              style={isActive ? { boxShadow: "0 0 0 3px rgba(59,130,246,0.1)" } : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lot.name}</p>
                    <p className="text-xs text-gray-500">
                      {isSuspended ? "暂停运营" : lot.hasRule ? "已配置规则" : "未配置规则"}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <svg className="w-5 h-5 text-brand-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
