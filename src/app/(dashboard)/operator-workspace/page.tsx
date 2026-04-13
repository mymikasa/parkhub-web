"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ExceptionQueue } from "@/components/operator-workspace/exception-queue";
import { EventFeed } from "@/components/operator-workspace/event-feed";
import { VehicleSearch } from "@/components/operator-workspace/vehicle-search";
import { LiftBarrierModal } from "@/components/operator-workspace/lift-barrier-modal";
import { ManualChargeModal } from "@/components/operator-workspace/manual-charge-modal";
import { CorrectPlateModal } from "@/components/operator-workspace/correct-plate-modal";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { operatorService } from "@/lib/api/operator";
import type { OperatorEvent, OperatorException, VehicleSearchResult } from "@/types";

export default function OperatorWorkspacePage() {
  const [events, setEvents] = useState<OperatorEvent[]>([]);
  const [exceptions, setExceptions] = useState<OperatorException[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  const [liftBarrierOpen, setLiftBarrierOpen] = useState(false);
  const [manualChargeOpen, setManualChargeOpen] = useState(false);
  const [correctPlateOpen, setCorrectPlateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [handleExceptionOpen, setHandleExceptionOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<OperatorException | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await operatorService.getEvents();
      setEvents(data);
    } catch {
      // error handled silently
    }
  }, []);

  const fetchExceptions = useCallback(async () => {
    try {
      const data = await operatorService.getExceptions();
      setExceptions(data);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchEvents(), fetchExceptions()]);
      setLoading(false);
    };
    load();
  }, [fetchEvents, fetchExceptions]);

  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchEvents();
      fetchExceptions();
    }, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchEvents, fetchExceptions]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).replace(/\//g, "-")
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLiftBarrier = async (data: { parkingLotId: string; laneId: string; reason: string }) => {
    setActionLoading(true);
    try {
      await operatorService.liftBarrier(data);
      setLiftBarrierOpen(false);
      fetchEvents();
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualCharge = async (data: { plateNumber: string; amount: number; paymentMethod: "wechat" | "alipay" | "cash"; remark: string }) => {
    setActionLoading(true);
    try {
      await operatorService.manualCharge(data);
      setManualChargeOpen(false);
      fetchEvents();
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  const handleCorrectPlate = async (data: { plateNumber: string; vehicleType: "temporary" | "monthly"; exceptionId?: string }) => {
    setActionLoading(true);
    try {
      await operatorService.correctPlate(data);
      setCorrectPlateOpen(false);
      fetchExceptions();
      fetchEvents();
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchVehicle = async (plateNumber: string): Promise<VehicleSearchResult | null> => {
    return operatorService.searchVehicle(plateNumber);
  };

  const handleRelease = async (result: VehicleSearchResult) => {
    setActionLoading(true);
    try {
      await operatorService.liftBarrier({
        parkingLotId: result.parkingLotId,
        laneId: "auto",
        reason: `放行车辆: ${result.plateNumber}`,
      });
      fetchEvents();
    } catch {
      // error handled silently
    } finally {
      setActionLoading(false);
    }
  };

  const handleExceptionAction = (exc: OperatorException) => {
    setSelectedException(exc);
    if (exc.type === "recognition_failed") {
      setCorrectPlateOpen(true);
    } else {
      setHandleExceptionOpen(true);
    }
  };

  const handleExceptionView = (exc: OperatorException) => {
    setSelectedException(exc);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <LoadingSkeleton variant="card" count={2} />
        <LoadingSkeleton variant="list" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="px-6 pt-4 pb-2 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-500">在线</span>
          </div>
          <span className="text-sm text-gray-400 tabular-nums">{currentTime}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-surface-border p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">快捷操作</h2>
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => setLiftBarrierOpen(true)}
                  className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center gap-3 hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-emerald-700">手动抬杆</span>
                </button>

                <button
                  onClick={() => setManualChargeOpen(true)}
                  className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200 flex flex-col items-center gap-3 hover:bg-blue-100 hover:border-blue-300 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-700">手动收费</span>
                </button>

                <button
                  onClick={() => setCorrectPlateOpen(true)}
                  className="p-5 rounded-xl bg-violet-50 border-2 border-violet-200 flex flex-col items-center gap-3 hover:bg-violet-100 hover:border-violet-300 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-violet-700">车牌补录</span>
                </button>

                <button
                  onClick={() => {
                    if (exceptions.length > 0) {
                      setSelectedException(exceptions[0]);
                      setHandleExceptionOpen(true);
                    }
                  }}
                  className="p-5 rounded-xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center gap-3 hover:bg-amber-100 hover:border-amber-300 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-amber-700">异常处理</span>
                </button>
              </div>
            </div>

            <ExceptionQueue
              exceptions={exceptions}
              onHandle={handleExceptionAction}
              onView={handleExceptionView}
            />

            <VehicleSearch onSearch={handleSearchVehicle} onRelease={handleRelease} />
          </div>

          <div className="col-span-4">
            <EventFeed events={events} />
          </div>
        </div>
      </div>

      <LiftBarrierModal
        open={liftBarrierOpen}
        onClose={() => setLiftBarrierOpen(false)}
        onSubmit={handleLiftBarrier}
        loading={actionLoading}
        exceptions={exceptions}
      />

      <ManualChargeModal
        open={manualChargeOpen}
        onClose={() => setManualChargeOpen(false)}
        onSubmit={handleManualCharge}
        loading={actionLoading}
      />

      <CorrectPlateModal
        open={correctPlateOpen}
        onClose={() => {
          setCorrectPlateOpen(false);
          setSelectedException(null);
        }}
        onSubmit={handleCorrectPlate}
        loading={actionLoading}
        exceptions={exceptions}
      />
    </div>
  );
}
