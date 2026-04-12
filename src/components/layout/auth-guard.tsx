"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";
import { loadSession } from "@/lib/session/storage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !loadSession()) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    setChecked(true);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-muted">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gray-500">加载中…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
