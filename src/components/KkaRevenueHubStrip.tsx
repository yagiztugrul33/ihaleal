import { Link } from "react-router-dom";
import { Landmark, BadgePercent, Calculator, ChevronRight, DraftingCompass } from "lucide-react";
import { KKA_HUB_PATH, KKA_STUDIO_PATH, kkaHubNavLabel, kkaHubSubtitle, kkaStudioNavLabel } from "@/lib/kkaHub";
import { cn } from "@/lib/utils";

export type KkaRevenueHubStripProps = {
  className?: string;
  /** Larger hit targets and emphasis (e.g. hero) */
  variant?: "default" | "prominent" | "corporate";
};

export function KkaRevenueHubStrip({ className, variant = "default" }: KkaRevenueHubStripProps = {}) {
  const prominent = variant === "prominent";
  const corporate = variant === "corporate";

  const shell = cn(
    "mt-4 w-full rounded-[20px] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)]",
    corporate
      ? "max-w-3xl border border-white/[0.08] bg-zinc-950/40 p-2 ring-1 ring-sky-500/10 backdrop-blur-sm"
      : "border border-white/[0.1] bg-zinc-900/55 ring-1 ring-white/[0.06]",
    !corporate && prominent ? "max-w-xl mx-auto lg:mx-0 p-1.5" : !corporate ? "max-w-xl mx-auto lg:mx-0 p-1" : "mx-auto lg:mx-0",
    className
  );

  const kkaCard = corporate
    ? "group flex flex-1 items-center gap-3 rounded-[20px] border border-sky-500/20 bg-gradient-to-br from-sky-950/35 via-zinc-950/80 to-zinc-950/90 text-start text-white shadow-inner shadow-black/20 transition-all duration-300 hover:border-sky-400/35 hover:from-sky-950/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/60"
    : "group flex flex-1 items-center gap-3 rounded-[20px] border border-red-700/30 bg-gradient-to-br from-red-950/45 to-zinc-900/85 text-start text-white shadow-inner shadow-black/25 transition-all duration-300 hover:from-red-900/55 hover:to-zinc-900/90 hover:border-red-600/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/70";

  const kkaIconWrap = corporate
    ? "flex shrink-0 items-center justify-center rounded-[20px] bg-sky-500/15 ring-1 ring-sky-400/25 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
    : "flex shrink-0 items-center justify-center rounded-[20px] bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100";

  const kkaIconClass = corporate ? "h-5 w-5 text-sky-200" : "h-5 w-5 text-red-200";

  const innerPad = corporate ? "gap-2.5 p-2 sm:flex-row sm:items-stretch" : cn("flex flex-col sm:flex-row sm:items-stretch", prominent ? "gap-2 p-2" : "gap-1.5 p-1.5");

  const linkHover = corporate
    ? "hover:border-sky-400/25 hover:bg-white/[0.06] focus-visible:outline-sky-500/50"
    : "hover:border-red-500/35 hover:bg-white/[0.07] focus-visible:outline-zinc-400";

  return (
    <div className={shell} role="navigation" aria-label="Gelir modeli ve kat kar_1l11 k1sayollar1">
      <div className={cn("flex flex-col sm:flex-row sm:items-stretch", innerPad)}>
        <Link
          to={KKA_HUB_PATH}
          className={cn(
            kkaCard,
            corporate ? "min-h-[3.5rem] px-4 py-3.5 sm:min-h-[3.75rem]" : prominent ? "min-h-[3.35rem] px-5 py-3.5" : "min-h-[3rem] px-4 py-3"
          )}
        >
          <span
            className={cn(
              kkaIconWrap,
              corporate ? "h-11 w-11 sm:h-12 sm:w-12" : prominent ? "h-12 w-12" : "h-11 w-11"
            )}
          >
            <Landmark className={kkaIconClass} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block font-normal tracking-tight", prominent || corporate ? "text-base" : "text-sm")}>{kkaHubNavLabel}</span>
            <span
              className={cn("block font-normal text-zinc-400 leading-snug", prominent || corporate ? "text-xs" : "text-[11px]")}
            >
              {kkaHubSubtitle}
            </span>
          </span>
          <ChevronRight className="rtl:rotate-180 h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden />
        </Link>

        <div
          className={cn(
            "flex flex-1 flex-col sm:min-w-[210px]",
            corporate ? "gap-2 sm:max-w-[300px]" : prominent ? "gap-2 sm:max-w-[280px]" : "gap-1.5 sm:max-w-[260px]"
          )}
        >
          <Link
            to="/komisyon-modeli"
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white/[0.04] font-normal text-zinc-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              linkHover,
              corporate ? "min-h-[2.85rem] px-3.5 py-2.5 text-[13px] sm:text-sm" : prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <BadgePercent className={cn("shrink-0 text-zinc-400", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Gelir modeli</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to="/komisyon-hesaplayici"
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white/[0.04] font-normal text-zinc-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              linkHover,
              corporate ? "min-h-[2.85rem] px-3.5 py-2.5 text-[13px] sm:text-sm" : prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Calculator className={cn("shrink-0 text-zinc-400", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">Komisyon hesapla</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
          <Link
            to={KKA_STUDIO_PATH}
            aria-label={`${kkaStudioNavLabel}: ada, parsel ve demo imar �zeti`}
            className={cn(
              "flex flex-1 items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white/[0.04] font-normal text-zinc-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              linkHover,
              corporate ? "min-h-[2.85rem] px-3.5 py-2.5 text-[13px] sm:text-sm" : prominent ? "min-h-[3rem] px-4 py-2.5 text-sm" : "min-h-[2.75rem] px-3 py-2 text-[13px]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <DraftingCompass className={cn("shrink-0 text-zinc-400", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
              <span className="truncate">{kkaStudioNavLabel}</span>
            </span>
            <ChevronRight className={cn("shrink-0 opacity-70", prominent || corporate ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
