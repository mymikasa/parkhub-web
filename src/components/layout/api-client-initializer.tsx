"use client";

import { useEffect } from "react";
import { initApiClient } from "@/lib/api/http-client";

export function ApiClientInitializer() {
  useEffect(() => {
    initApiClient();
  }, []);

  return null;
}
