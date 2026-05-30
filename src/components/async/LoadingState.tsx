import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  compact?: boolean;
};

export function LoadingState({ label = "Yükleniyor…", className, compact = false }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 gap-2" : "py-16 gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn("animate-spin text-blue-400", compact ? "h-6 w-6" : "h-9 w-9")} aria-hidden />
      <p className={cn("text-slate-500", compact ? "text-xs" : "text-sm")}>{label}</p>
    </div>
  );
}

export function LoadingSkeletonGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40" />
      ))}
    </div>
  );
}
