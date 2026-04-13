"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import type { Device } from "@/types";
import { cn } from "@/lib/utils";

interface RemoteControlModalProps {
  open: boolean;
  onClose: () => void;
  device: Device | null;
  onCommand: (action: "up" | "down") => Promise<void>;
}

export function RemoteControlModal({ open, onClose, device, onCommand }: RemoteControlModalProps) {
  const [executing, setExecuting] = useState<"up" | "down" | null>(null);

  const handleCommand = async (action: "up" | "down") => {
    setExecuting(action);
    try {
      await onCommand(action);
    } finally {
      setExecuting(null);
    }
  };

  if (!device) return null;

  return (
    <Modal open={open} onClose={onClose} title="远程控制" maxWidth="max-w-sm">
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-sm font-mono font-medium text-gray-900">{device.serialNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {device.parkingLotName} · {device.laneName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleCommand("up")}
            disabled={executing !== null}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              executing === "up"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
            )}
          >
            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {executing === "up" ? "执行中..." : "抬杆"}
            </span>
          </button>

          <button
            onClick={() => handleCommand("down")}
            disabled={executing !== null}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              executing === "down"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
            )}
          >
            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {executing === "down" ? "执行中..." : "落杆"}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
