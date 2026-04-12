import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "default";

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

export function StatusBadge({ variant = "default", children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-emerald-500": variant === "success",
          "bg-amber-500": variant === "warning",
          "bg-red-500": variant === "error",
          "bg-gray-400": variant === "default",
        })}
      />
      {children}
    </span>
  );
}
