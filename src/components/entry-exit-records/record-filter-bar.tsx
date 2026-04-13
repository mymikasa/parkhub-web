"use client";

import { useState } from "react";
import type { RecordFilters, ParkingLot } from "@/types";

interface RecordFilterBarProps {
  filters: RecordFilters;
  parkingLots: ParkingLot[];
  onFilter: (filters: RecordFilters) => void;
  onReset: () => void;
}

export function RecordFilterBar({ filters, parkingLots, onFilter, onReset }: RecordFilterBarProps) {
  const [local, setLocal] = useState<RecordFilters>(filters);

  const handleSubmit = () => {
    onFilter(local);
  };

  const handleReset = () => {
    setLocal({});
    onReset();
  };

  return (
    <div className="bg-white rounded-xl border border-surface-border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">开始日期</label>
          <input
            type="date"
            value={local.dateFrom ?? ""}
            onChange={(e) => setLocal({ ...local, dateFrom: e.target.value || undefined })}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">结束日期</label>
          <input
            type="date"
            value={local.dateTo ?? ""}
            onChange={(e) => setLocal({ ...local, dateTo: e.target.value || undefined })}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">车牌号</label>
          <input
            type="text"
            placeholder="搜索车牌号"
            value={local.plateNumber ?? ""}
            onChange={(e) => setLocal({ ...local, plateNumber: e.target.value || undefined })}
            className="h-9 w-40 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">停车场</label>
          <select
            value={local.parkingLotId ?? ""}
            onChange={(e) => setLocal({ ...local, parkingLotId: e.target.value || undefined })}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">全部车场</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>{lot.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">类型</label>
          <select
            value={local.type ?? ""}
            onChange={(e) => setLocal({ ...local, type: (e.target.value || undefined) as RecordFilters["type"] })}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">全部类型</option>
            <option value="entry">入场</option>
            <option value="exit">出场</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">状态</label>
          <select
            value={local.status ?? ""}
            onChange={(e) => setLocal({ ...local, status: (e.target.value || undefined) as RecordFilters["status"] })}
            className="h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="paid">已缴费</option>
            <option value="exception">异常</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            className="h-9 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            查询
          </button>
          <button
            onClick={handleReset}
            className="h-9 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
