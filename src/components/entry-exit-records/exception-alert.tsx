import type { RecordSummary } from "@/types";

interface ExceptionAlertProps {
  summary: RecordSummary;
  onViewExceptions: () => void;
}

export function ExceptionAlert({ summary, onViewExceptions }: ExceptionAlertProps) {
  if (summary.totalExceptions === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">
            发现 {summary.totalExceptions} 条异常记录需要处理
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            有入无出 {summary.entryNoExit} 条 / 有出无入 {summary.exitNoEntry} 条 / 识别失败 {summary.recognitionFailed} 条
          </p>
        </div>
      </div>
      <button
        onClick={onViewExceptions}
        className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
      >
        查看异常
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
