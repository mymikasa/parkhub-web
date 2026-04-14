interface DurationCardProps {
  entryTime: string;
  currentTime: string;
  duration: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseDuration(duration: string): { hours: string; minutes: string } {
  const hourMatch = duration.match(/(\d+)小时/);
  const minMatch = duration.match(/(\d+)分钟/);
  return {
    hours: hourMatch ? hourMatch[1] : "0",
    minutes: minMatch ? minMatch[1] : "00",
  };
}

export function DurationCard({ entryTime, currentTime, duration }: DurationCardProps) {
  const { hours, minutes } = parseDuration(duration);

  return (
    <div
      className="bg-white rounded-2xl card-shadow p-5 mb-4 animate-fade-in"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">停车时长</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-xs text-gray-500 mb-1">入场时间</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(entryTime)}</div>
          <div className="text-lg font-bold text-gray-900">{formatTime(entryTime)}</div>
        </div>
        <div className="p-3 bg-brand-50 rounded-xl">
          <div className="text-xs text-brand-600 mb-1">当前时间</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(currentTime)}</div>
          <div className="text-lg font-bold text-brand-600">{formatTime(currentTime)}</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">已停时长</span>
        <div className="text-xl font-bold text-gray-900">
          <span className="text-brand-600">{hours}</span>小时{" "}
          <span className="text-brand-600">{minutes}</span>分钟
        </div>
      </div>
    </div>
  );
}
