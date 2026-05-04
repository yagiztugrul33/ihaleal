import { Link } from "react-router-dom";
import { Landmark, BadgePercent, Calculator, ChevronRight, DraftingCompass } from "lucide-react";
import { KKA_HUB_PATH, KKA_STUDIO_PATH, kkaHubNavLabel, kkaHubSubtitle, kkaStudioNavLabel } from "@/lib/kkaHub";
import { cn } from "@/lib/utils";

export type KkaRevenueHubStripProps = {
  className?: string;
  /** Larger hit targets and emphasis (e.g. hero) */
  variant?: "default" | "prominent";
};

export function KkaRevenueHubStrip({ className, variant = "default" }: KkaRevenueHubStripProps = {}) {
  const prominent = variant === "prominent";

  return (
    <div
      className={cn(
        "mt-4 w-full rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/35 via-slate-900/60 to-violet-950/25 shadow-[0_20px_50px_-24px_rgba(16,185,129,0.35)] ring-1 ring-white/[0.06]",
        prominent
          ? "max-w-2xl mx-auto lg:mx-0 p-1.5 ring-2 ring-emerald-400/30 shadow-[0_28px_70px_-20px_rgba(16,185,129,0.5)]"
          : "max-w-xl mx-auto lg:mx-0 p-1",
        className
      )}
      role="navigation"
      aria-label="Gelir modeli ve kat karşılığı kısayolları"
    >
      <div className={cn("flex flex-col sm:flex-row sm:items-stretch", prominent ? "gap-2 p-2" : "gap-1.5 p-1.5")}>
        <Link
          to={KKA_HUB_PATH}
          className={cn(
            "group flex flex-1 items-center gap-3 rounded-xl bg-gradient-to-br from-emerald-600/95 to-teal-700/90 text-left text-white shadow-inner shadow-black/20 transition-all duration-300 hover:from-emerald-500 hover:to-teal-600 hover:shadow-[0_12px_40px_-12px_rgba(52,211,153,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
            prominent ? "min-h-[3.35rem] px-5 py-3.5" : "min-h-[3rem] px-4 py-3"
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100",
              prominent ? "h-12 w-12" : "h-11 w-11"
            )}
          >
            <Landmark className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block font-bold tracking-tight", prominent ? "text-base" : "text-sm")}>{kkaHubNavLabel}</span>
            <span className={cn("block font-medium text-emerald-50/85 leading-snug", prominent ? "text-xs" : "text-[11px]")}>
              {kkaHubSubtitle}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden />
        </Link>

        <div
          className={cn(
            "flex flex-1 flex-col sm:min-w-[210px]",
            prominent ? "gap-2 sm:max-w-[280px]" : "gap-1.5 sm:max-w-[260px]"
          )}
        >
          <Link
            to="/komisyon-modeli"
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 font-semibold text-violet-100 transition-colors hover:border-violet-300/45 hover:bg-violet-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <BadgePercent className={cn("shrink-0 text-violet-300", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Gelir modeli</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to="/komisyon-hesaplayici"
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 font-semibold text-amber-100 transition-colors hover:border-amber-300/45 hover:bg-amber-500/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Calculator className={cn("shrink-0 text-amber-300", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Komisyon hesapla</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to={KKA_STUDIO_PATH}
            aria-label={`${kkaStudioNavLabel}: ada, parsel ve demo imar özeti`}
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 font-semibold text-cyan-100 transition-colors hover:border-cyan-300/45 hover:bg-cyan-500/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <DraftingCompass className={cn("shrink-0 text-cyan-300", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">{kkaStudioNavLabel}</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
