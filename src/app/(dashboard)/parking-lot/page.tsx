"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ParkingLotCard } from "@/components/parking-lot/parking-lot-card";
import { CreateParkingLotModal } from "@/components/parking-lot/create-parking-lot-modal";
import { EditParkingLotModal } from "@/components/parking-lot/edit-parking-lot-modal";
import { LaneConfigModal } from "@/components/parking-lot/lane-config-modal";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { ParkingLot, ParkingLotSummary } from "@/types";

export default function ParkingLotPage() {
  const [summary, setSummary] = useState<ParkingLotSummary | null>(null);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [laneConfigOpen, setLaneConfigOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);

  const pageSize = 6;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await parkingLotService.getSummary();
      setSummary(data);
    } catch {}
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await parkingLotService.list({
        page,
        pageSize,
        keyword: keyword || undefined,
      });
      setLots(res.data);
      setTotal(res.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 300);
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleRefresh = () => {
    fetchSummary();
    fetchList();
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="停车场管理"
        description="管理旗下所有停车场及出入口配置"
        actions={
          <>
            <SearchInput
              placeholder="搜索车场..."
              value={keyword}
              onChange={handleSearchChange}
            />
            <button
              onClick={() => setCreateOpen(true)}
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium flex items-center gap-2 hover:from-brand-700 hover:to-brand-800 transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新建车场
            </button>
          </>
        }
      />

      {summary && (
        <section className="grid grid-cols-4 gap-5">
          <StatCard
            label="总车位数"
            value={summary.totalSpots}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            iconBgClass="bg-brand-50"
            iconTextClass="text-brand-600"
          />
          <StatCard
            label="剩余车位"
            value={summary.availableSpots}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconBgClass="bg-emerald-50"
            iconTextClass="text-emerald-600"
            valueColorClass="text-emerald-600"
          />
          <StatCard
            label="在场车辆"
            value={summary.occupiedSpots}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            iconBgClass="bg-amber-50"
            iconTextClass="text-amber-600"
            valueColorClass="text-amber-600"
          />
          <StatCard
            label="出入口数"
            value={summary.laneCount}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            }
            iconBgClass="bg-blue-50"
            iconTextClass="text-blue-600"
            valueColorClass="text-blue-600"
          />
        </section>
      )}

      <section>
        {loading ? (
          <LoadingSkeleton variant="card" count={4} className="grid grid-cols-2 gap-5" />
        ) : error ? (
          <ErrorState onRetry={handleRefresh} />
        ) : lots.length === 0 ? (
          <EmptyState
            title="暂无停车场数据"
            description="点击下方按钮创建第一个停车场"
            action={
              <button
                onClick={() => setCreateOpen(true)}
                className="h-10 px-5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-700 hover:to-brand-800 transition-all"
              >
                新建车场
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5">
              {lots.map((lot) => (
                <ParkingLotCard
                  key={lot.id}
                  lot={lot}
                  onEdit={(lot) => {
                    setSelectedLot(lot);
                    setEditOpen(true);
                  }}
                  onConfigureLanes={(lot) => {
                    setSelectedLot(lot);
                    setLaneConfigOpen(true);
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      <CreateParkingLotModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      <EditParkingLotModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedLot(null);
        }}
        onSuccess={handleRefresh}
        parkingLot={selectedLot}
      />

      <LaneConfigModal
        open={laneConfigOpen}
        onClose={() => {
          setLaneConfigOpen(false);
          setSelectedLot(null);
        }}
        onSuccess={handleRefresh}
        parkingLot={selectedLot}
      />
    </div>
  );
}
