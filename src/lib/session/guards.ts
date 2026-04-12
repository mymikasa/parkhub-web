"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";
import { loadSession } from "@/lib/session/storage";

const PROTECTED_PREFIXES = [
  "/tenant-management",
  "/parking-lot",
  "/device-management",
  "/billing-rules",
  "/realtime-monitor",
  "/entry-exit-records",
  "/operator-workspace",
];

const AUTH_PAGES = ["/login", "/oauth"];

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
    const isAuthPage = AUTH_PAGES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

    if (isProtected && !isAuthenticated) {
      const hasSession = !!loadSession();
      if (!hasSession) {
        router.replace(ROUTES.LOGIN);
      }
    }

    if (isAuthPage && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD_HOME);
    }
  }, [isAuthenticated, isLoading, pathname, router]);
}
