import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "table";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "card", count = 3, className }: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-surface-border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-surface-border animate-pulse flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-surface-border overflow-hidden", className)}>
      <div className="border-b border-surface-border p-4 flex gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-24" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-surface-border p-4 flex gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
