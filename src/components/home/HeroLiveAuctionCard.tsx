import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ROUTES } from "@/constants/routes";

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
      className={["premium-live-card", className].filter(Boolean).join(" ")}
      aria-label={title}
    >
      <div className="premium-live-card__top">
        <span>{title}</span>
        <span className="premium-live-card__pulse">
          <i aria-hidden />
          {liveLabel}
        </span>
      </div>
      <strong className="premium-live-card__value">284</strong>
      <p className="premium-live-card__growth">
        <span>+18%</span> {growthLabel}
      </p>
      <div className="premium-live-card__chart" aria-hidden>
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
      <Link to={ROUTES.ILANLAR} className="premium-live-card__link">
        {viewLabel} →
      </Link>
    </article>
  );
}
