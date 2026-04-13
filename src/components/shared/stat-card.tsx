"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  valueColorClass?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconBgClass = "bg-brand-50",
  iconTextClass = "text-brand-600",
  valueColorClass = "text-gray-900",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 border border-surface-border card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={cn("text-2xl font-bold mt-1", valueColorClass)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconBgClass
          )}
        >
          <span className={cn(iconTextClass)}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
