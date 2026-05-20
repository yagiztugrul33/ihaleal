import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TREND = Array.from({ length: 12 }, (_, i) => ({
  x: i,
  y: 42 + i * 6 + (i % 3) * 4,
}));

export function HeroLiveAuctionCard({
  title,
  liveLabel,
  growthLabel,
  viewLabel,
  className,
}: {
  title: string;
  liveLabel: string;
  growthLabel: string;
  viewLabel: string;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <article
      className={cn(
        "w-full rounded-2xl border border-blue-400/20 bg-slate-950/85 p-4 shadow-2xl shadow-blue-900/20 backdrop-blur-md",
        className,
      )}
      aria-label={title}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{title}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-300">
          <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {liveLabel}
        </span>
      </div>
      <strong className="premium-live-card__value block text-3xl font-extrabold text-white">284</strong>
      <p className="mt-1 text-sm text-slate-300">
        <span className="mr-1 font-semibold text-emerald-300">+18%</span>
        {growthLabel}
      </p>
      <div className="mt-3 h-14" aria-hidden>
        <ResponsiveContainer width="100%" height={56}>
          <AreaChart data={TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="heroLiveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#heroLiveFill)"
              isAnimationActive={!reduced}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Link
        to={ROUTES.ILANLAR}
        className="mt-3 inline-flex items-center rounded-lg border border-blue-400/30 px-3 py-1.5 text-xs font-semibold text-blue-200 transition hover:border-blue-300 hover:text-white"
      >
        {viewLabel} <span aria-hidden className="ml-1">→</span>
      </Link>
    </article>
  );
}
