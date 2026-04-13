"use client";

import type { OperatorEvent } from "@/types";

interface EventFeedProps {
  events: OperatorEvent[];
}

function getEventStyle(type: OperatorEvent["type"]) {
  switch (type) {
    case "entry":
      return { bg: "bg-emerald-100", text: "text-emerald-600", icon: "entry" };
    case "exit":
      return { bg: "bg-blue-100", text: "text-blue-600", icon: "exit" };
    case "exception":
      return { bg: "bg-amber-100", text: "text-amber-600", icon: "exception", rowBg: "bg-amber-50/50" };
    case "device_offline":
      return { bg: "bg-red-100", text: "text-red-600", icon: "device_offline", rowBg: "bg-red-50/50" };
  }
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "entry":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
        </svg>
      );
    case "exit":
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    case "exception":
      return (
        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    case "device_offline":
      return (
        <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
        </svg>
      );
    default:
      return null;
  }
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  return `${minutes}分钟前`;
}

export function EventFeed({ events }: EventFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-gray-900">实时事件</span>
        </div>
        <span className="text-xs text-gray-400">自动刷新</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
        {events.map((event) => {
          const style = getEventStyle(event.type);
          return (
            <div
              key={event.id}
              className={`px-5 py-4 animate-[slideInRight_0.3s_ease] ${style.rowBg ?? ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  <EventIcon type={style.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${event.type === "exception" ? "text-amber-800" : event.type === "device_offline" ? "text-red-800" : "text-gray-900"}`}>
                    {event.message}
                  </div>
                  <div className={`text-xs mt-0.5 ${event.type === "exception" ? "text-amber-600" : event.type === "device_offline" ? "text-red-600" : "text-gray-500"}`}>
                    {event.parkingLotName}{event.laneName ? ` · ${event.laneName}` : ""}
                    {event.fee !== undefined && event.fee !== null ? ` · ¥${event.fee.toFixed(2)}` : ""}
                  </div>
                  <div className={`text-xs mt-1 ${event.type === "exception" ? "text-amber-500" : event.type === "device_offline" ? "text-red-500" : "text-gray-400"}`}>
                    {getTimeAgo(event.time)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
