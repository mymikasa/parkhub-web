"use client";

import { useState } from "react";
import type { VehicleSearchResult } from "@/types";
import type { OperatorException } from "@/types";

interface VehicleSearchProps {
  onSearch: (plateNumber: string) => Promise<VehicleSearchResult | null>;
  onRelease: (result: VehicleSearchResult) => void;
}

export function VehicleSearch({ onSearch, onRelease }: VehicleSearchProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VehicleSearchResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!plateNumber.trim()) return;
    setSearching(true);
    try {
      const data = await onSearch(plateNumber.trim());
      setResult(data);
      setSearched(true);
    } catch {
      setResult(null);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="bg-white rounded-xl border border-surface-border p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">在场车辆查询</h2>
      <div className="flex gap-4 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入车牌号查询..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="h-11 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
        >
          {searching ? "查询中..." : "查询"}
        </button>
      </div>

      {searched && result && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">{result.plateNumber}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    {result.vehicleType === "temporary" ? "临时车" : "月卡车"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{result.parkingLotName} · {result.laneName}入场</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">已停时长</div>
              <div className="text-lg font-bold text-gray-900">{result.duration}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">预估费用</div>
              <div className="text-lg font-bold text-brand-600">¥{result.estimatedFee.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-white transition-colors">详情</button>
              <button
                onClick={() => onRelease(result)}
                className="h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
              >
                放行
              </button>
            </div>
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="text-center py-8 text-gray-500 text-sm">未找到该车辆的在场记录</div>
      )}
    </div>
  );
}
