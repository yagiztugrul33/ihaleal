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

/** Ö2: satır listesi skeleton'u — bildirim/mesaj/rapor listeleri için spinner yerine. */
export function LoadingSkeletonList({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-800/80" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/80" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ö2: detay sayfası skeleton'u — büyük görsel + başlık + yan panel iskeleti. */
export function LoadingSkeletonDetail({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-8", className)} role="status" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-6 w-1/3 animate-pulse rounded bg-slate-800/80" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/80" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800/60" />
          <div className="h-32 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40" />
        </div>
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40" />
          <div className="h-24 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40" />
        </div>
      </div>
    </div>
  );
}
