"use client";

import { useState, useEffect } from "react";
import { KpiCards } from "@/components/realtime-monitor/kpi-cards";
import { EventStream } from "@/components/realtime-monitor/event-stream";
import { OccupancyPanel } from "@/components/realtime-monitor/occupancy-panel";
import { LongParkAlerts } from "@/components/realtime-monitor/long-park-alerts";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useMonitorRealtime } from "@/hooks/use-monitor";

export default function RealtimeMonitorPage() {
  const { data, isLoading: loading } = useMonitorRealtime();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("zh-CN", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        }).replace(/\//g, "-")
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton variant="card" count={4} className="grid grid-cols-4 gap-5" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7"><LoadingSkeleton variant="list" count={6} /></div>
          <div className="col-span-5 space-y-6"><LoadingSkeleton variant="card" count={3} /></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-0">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-500">实时更新中</span>
          </div>
        </div>
        <span className="text-sm text-gray-400 tabular-nums">{currentTime}</span>
      </div>
      <div className="px-6 py-4"><KpiCards kpi={data.kpi} /></div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7"><EventStream events={data.events} /></div>
          <div className="col-span-5 space-y-6">
            <OccupancyPanel occupancies={data.occupancies} />
            <LongParkAlerts alerts={data.longParkAlerts} />
          </div>
        </div>
      </div>
    </div>
  );
}
