import { useEffect, useState } from "react";
import { Clock, Flame, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * İhale geri sayım — gün:saat:dakika:saniye.
 * Master Dalga 2-1: Aciliyet hissi için renk varyantları.
 * - status="upcoming" → mavi (yaklaşan)
 * - >24h kaldı → yeşil/emerald (normal)
 * - 1-24h kaldı → amber (yaklaşıyor)
 * - <1h kaldı → red + pulse (acil)
 * - bitti → gri "İhale sona erdi"
 *
 * 1 saniyede bir güncellenir; bileşen unmount/visible olduğu sürece.
 */

type Status = "live" | "upcoming" | "ended";

type Props = {
  endDate: string | Date; // ISO veya Date
  status?: Status;
  startDate?: string | Date; // upcoming için (yaklaşan tarihte sayar)
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "compact" | "wide";
};

function diffParts(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function CountdownTimer({
  endDate,
  status = "live",
  startDate,
  className,
  size = "md",
  layout = "wide",
}: Props) {
  // Hedef tarih — upcoming ise startDate, aksi halde endDate
  const targetIso = status === "upcoming" && startDate ? startDate : endDate;
  const targetMs =
    typeof targetIso === "string" ? new Date(targetIso).getTime() : targetIso.getTime();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status === "ended") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  // Ended override — endDate geçtiyse de "ended" göster
  const computedStatus: Status =
    status === "ended" || (status === "live" && targetMs - now <= 0) ? "ended" : status;

  if (computedStatus === "ended") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-400",
          size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2 text-sm",
          className,
        )}
        data-testid="countdown-ended"
      >
        <Hourglass className="w-4 h-4" aria-hidden />
        <span>İhale sona erdi</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds, diff } = diffParts(targetMs, now);
  const totalHours = diff / 3600000;

  // Renk tema — kalan süreye göre
  const tone =
    computedStatus === "upcoming"
      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
      : totalHours < 1
        ? "border-red-500/50 bg-red-500/15 text-red-100 animate-pulse"
        : totalHours < 24
          ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
          : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";

  const label =
    computedStatus === "upcoming"
      ? "Başlamaya kalan"
      : totalHours < 1
        ? "SON SAAT"
        : totalHours < 24
          ? "Bitişe kalan"
          : "Bitişe kalan";

  const Icon = totalHours < 1 ? Flame : Clock;

  // Kompakt ve geniş layout
  if (layout === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border",
          tone,
          size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2 text-sm",
          className,
        )}
        data-testid="countdown-compact"
        aria-live="polite"
      >
        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
        <span className="font-mono tabular-nums font-semibold">
          {days > 0 ? `${days}g ` : ""}
          {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-xl border", tone, "px-4 py-3", className)}
      data-testid="countdown-wide"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-1 text-[11px] uppercase tracking-wider font-semibold opacity-80">
        <Icon className="w-3.5 h-3.5" aria-hidden /> {label}
      </div>
      <div className="grid grid-cols-4 gap-2 font-mono tabular-nums">
        {[
          { v: days, l: "Gün" },
          { v: hours, l: "Saat" },
          { v: minutes, l: "Dakika" },
          { v: seconds, l: "Saniye" },
        ].map((unit) => (
          <div key={unit.l} className="rounded-lg bg-slate-950/30 px-2 py-2 text-center">
            <div className={cn("font-bold leading-none", size === "lg" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>
              {pad2(unit.v)}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{unit.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
