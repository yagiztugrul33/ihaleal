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
        "mt-4 w-full rounded-xl border border-white/[0.1] bg-zinc-900/55 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]",
        prominent
          ? "max-w-xl mx-auto lg:mx-0 p-1.5"
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
            "group flex flex-1 items-center gap-3 rounded-xl border border-red-700/30 bg-gradient-to-br from-red-950/45 to-zinc-900/85 text-left text-white shadow-inner shadow-black/25 transition-all duration-300 hover:from-red-900/55 hover:to-zinc-900/90 hover:border-red-600/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/70",
            prominent ? "min-h-[3.35rem] px-5 py-3.5" : "min-h-[3rem] px-4 py-3"
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100",
              prominent ? "h-12 w-12" : "h-11 w-11"
            )}
          >
            <Landmark className="h-5 w-5 text-red-200" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block font-bold tracking-tight", prominent ? "text-base" : "text-sm")}>{kkaHubNavLabel}</span>
            <span className={cn("block font-medium text-zinc-400 leading-snug", prominent ? "text-xs" : "text-[11px]")}>
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
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] font-semibold text-zinc-100 transition-colors hover:border-red-500/35 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <BadgePercent className={cn("shrink-0 text-zinc-400", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Gelir modeli</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to="/komisyon-hesaplayici"
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] font-semibold text-zinc-100 transition-colors hover:border-red-500/35 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Calculator className={cn("shrink-0 text-zinc-400", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Komisyon hesapla</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to={KKA_STUDIO_PATH}
            aria-label={`${kkaStudioNavLabel}: ada, parsel ve demo imar özeti`}
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] font-semibold text-zinc-100 transition-colors hover:border-red-500/35 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400",
              prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <DraftingCompass className={cn("shrink-0 text-zinc-400", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">{kkaStudioNavLabel}</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
