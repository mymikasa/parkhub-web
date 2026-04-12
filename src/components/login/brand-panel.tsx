"use client";

import { cn } from "@/lib/utils";

export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
      style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">ParkHub</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center -mt-8">
        <h1 className="text-white text-4xl xl:text-5xl font-bold leading-tight mb-4">
          智慧停车<br />管理平台
        </h1>
        <p className="text-blue-200/80 text-lg max-w-md leading-relaxed mb-12">
          为物业公司与商业综合体打造的一站式停车管理解决方案，涵盖车辆出入管理、智能计费、设备联动与数据分析。
        </p>

        <div className="flex gap-4">
          <StatCard
            icon={
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            iconBg="bg-emerald-400/20"
            label="今日通行"
            value="12,847"
            trend="+8.3%"
            trendColor="text-emerald-400"
            floatDelay="0s"
          />
          <StatCard
            icon={
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconBg="bg-amber-400/20"
            label="接入车场"
            value="326"
            trend="本月新增 12 家"
            trendColor="text-amber-400"
            floatDelay="2s"
          />
          <StatCard
            icon={
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
            iconBg="bg-violet-400/20"
            label="在线设备"
            value="1,204"
            trend="在线率 99.6%"
            trendColor="text-emerald-400"
            floatDelay="0s"
          />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-blue-200/40 text-sm">&copy; 2026 ParkHub. 让每一次停车都更智能。</p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
  trendColor,
  floatDelay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  floatDelay: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 backdrop-blur-[12px] bg-white/10 border border-white/15",
        floatDelay === "0s" ? "animate-float" : "animate-float-delay"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-blue-200/60 text-sm">{label}</span>
      </div>
      <div className="text-white text-2xl font-bold">{value}</div>
      <div className={`${trendColor} text-xs mt-1`}>
        <svg className="inline w-2.5 h-2.5 mr-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        {trend}
      </div>
    </div>
  );
}
