interface OfflineAlertProps {
  offlineCount: number;
}

export function OfflineAlert({ offlineCount }: OfflineAlertProps) {
  if (offlineCount === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-800">
        {offlineCount} 台设备离线超过15分钟，请及时排查
      </p>
    </div>
  );
}
