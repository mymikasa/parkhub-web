"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/modal";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { parkingLotService } from "@/lib/api/parking-lots";
import type { Tenant, ParkingLot } from "@/types";

interface ViewParkingLotsModalProps {
  open: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

export function ViewParkingLotsModal({ open, onClose, tenant }: ViewParkingLotsModalProps) {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !tenant) return;
    setLoading(true);
    setError(false);
    import("@/lib/api/tenants").then(({ tenantService }) => {
      tenantService
        .getParkingLots(tenant.id)
        .then((data) => {
          setLots(data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    });
  }, [open, tenant]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="关联停车场"
      subtitle={tenant ? tenant.companyName : ""}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : error ? (
        <div className="text-center py-8 text-sm text-gray-500">加载失败</div>
      ) : lots.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          该租户暂无关联停车场
        </div>
      ) : (
        <div className="space-y-3">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{lot.name}</p>
                  <p className="text-xs text-gray-500">{lot.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{lot.totalSpots} 车位</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lot.status === "operating" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {lot.status === "operating" ? "运营中" : "已暂停"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
