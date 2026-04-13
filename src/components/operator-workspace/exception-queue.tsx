"use client";

import type { OperatorException } from "@/types";

interface ExceptionQueueProps {
  exceptions: OperatorException[];
  onHandle: (exception: OperatorException) => void;
  onView: (exception: OperatorException) => void;
}

function getExceptionTypeLabel(type: OperatorException["type"]): { label: string; bgClass: string; textClass: string; iconBg: string; icon: React.ReactNode } {
  switch (type) {
    case "entry_no_exit":
      return {
        label: "有入无出",
        bgClass: "bg-red-50",
        textClass: "text-red-600",
        iconBg: "bg-red-100",
        icon: (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
      };
    case "exit_no_entry":
      return {
        label: "有出无入",
        bgClass: "bg-red-50",
        textClass: "text-red-600",
        iconBg: "bg-red-100",
        icon: (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case "recognition_failed":
      return {
        label: "识别失败",
        bgClass: "bg-amber-50",
        textClass: "text-amber-600",
        iconBg: "bg-amber-100",
        icon: (
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      };
  }
}

function formatEntryInfo(exc: OperatorException): string {
  if (exc.entryTime) {
    const d = new Date(exc.entryTime);
    const timeStr = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return `${exc.parkingLotName} · 入场: ${timeStr} · 已超 ${exc.overtime}`;
  }
  const d = new Date(exc.time);
  const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  return `${exc.parkingLotName} · ${exc.laneName ?? ""} · ${timeStr}`;
}

export function ExceptionQueue({ exceptions, onHandle, onView }: ExceptionQueueProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900">待处理异常</span>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">{exceptions.length} 条</span>
        </div>
        <a href="/entry-exit-records" className="text-xs text-brand-600 hover:text-brand-700">查看全部 →</a>
      </div>
      <div className="divide-y divide-gray-100">
        {exceptions.map((exc) => {
          const config = getExceptionTypeLabel(exc.type);
          return (
            <div key={exc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${exc.type === "recognition_failed" ? "text-amber-600" : "text-gray-900"}`}>
                      {exc.plateNumber}
                    </span>
                    <span className={`text-xs ${config.textClass} ${config.bgClass} px-2 py-0.5 rounded`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatEntryInfo(exc)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(exc)}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  查看
                </button>
                <button
                  onClick={() => onHandle(exc)}
                  className={`h-8 px-3 rounded-lg text-xs text-white transition-colors ${
                    exc.type === "recognition_failed"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {exc.type === "recognition_failed" ? "补录" : "处理"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
