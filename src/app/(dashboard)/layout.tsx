"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/tenant-management": { title: "租户管理", description: "管理平台所有租户及其停车场配置" },
  "/parking-lot": { title: "停车场管理", description: "管理所有停车场及车道配置" },
  "/device-management": { title: "设备管理", description: "查看和管理所有设备" },
  "/billing-rules": { title: "计费规则", description: "配置各停车场计费规则" },
  "/realtime-monitor": { title: "实时监控", description: "实时运营数据大屏" },
  "/entry-exit-records": { title: "出入记录", description: "查询和管理车辆出入记录" },
  "/operator-workspace": { title: "操作员工作台", description: "快捷操作和异常处理" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageInfo = PAGE_TITLES[pathname];

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-surface-muted">
        <Sidebar />
        <main className="flex-1 ml-64">
          <header className="bg-white border-b border-surface-border sticky top-0 z-10">
            <div className="px-8 py-4">
              {pageInfo && (
                <>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pageInfo.description}
                  </p>
                </>
              )}
            </div>
          </header>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <svg className="w-6 h-6 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
