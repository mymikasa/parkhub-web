"use client";

import Link from "next/link";
import type { MonitorEvent } from "@/types";

interface EventStreamProps {
  events: MonitorEvent[];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export function EventStream({ events }: EventStreamProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-900">实时通行记录</span>
        </div>
        <Link href="/entry-exit-records" className="text-xs text-brand-600 hover:text-brand-700">查看全部 →</Link>
      </div>
      <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className={`px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors animate-[slideIn_0.3s_ease] ${
              event.type === "exception" ? "bg-amber-50/30" : ""
            }`}
          >
            <div className="w-16 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    event.type === "entry"
                      ? "bg-emerald-50 text-emerald-700"
                      : event.type === "exit"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {event.type === "entry" && (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                  )}
                  {event.type === "exit" && (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                  {event.type === "exception" && (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {event.type === "entry" ? "入场" : event.type === "exit" ? "出场" : "异常"}
                </span>
                <span className="font-mono font-bold text-gray-900">{event.plateNumber}</span>
              </div>
              <div className={`text-xs mt-1 ${event.type === "exception" ? "text-amber-600" : "text-gray-500"}`}>
                {event.parkingLotName} · {event.laneName}
                {event.exceptionReason && ` · ${event.exceptionReason}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-900">{formatTime(event.time)}</div>
              {event.fee !== null && event.fee !== undefined ? (
                <div className="text-xs text-emerald-600 font-medium">¥{event.fee.toFixed(2)}</div>
              ) : (
                <div className="text-xs text-gray-400">{getTimeAgo(event.time)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
