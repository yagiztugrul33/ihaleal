import { useMemo } from "react";
import type { EarthquakeScorePayload } from "@/types/property/earthquake";
import { ensureEarthquakeScore } from "@/lib/property/earthquakeScore";
import type { PropertyRecord } from "@/types/property";

const bandClass: Record<string, string> = {
  critical: "eq-badge--critical",
  low: "eq-badge--low",
  moderate: "eq-badge--moderate",
  good: "eq-badge--good",
  excellent: "eq-badge--excellent",
};

function topFour(data: EarthquakeScorePayload) {
  return [...data.subScores].sort((a, b) => b.score - a.score).slice(0, 4);
}

export interface EarthquakeScoreBadgeProps {
  property: PropertyRecord;
  className?: string;
}

export function EarthquakeScoreBadge({ property, className }: EarthquakeScoreBadgeProps) {
  const data = useMemo(() => ensureEarthquakeScore(property), [property]);
  const top = useMemo(() => topFour(data), [data]);
  const bc = bandClass[data.band] ?? "eq-badge--moderate";

  return (
    <div className={`eq-badge-wrap ${className ?? ""}`.trim()}>
      <div
        className={`eq-badge ${bc}`}
        role="img"
        aria-label={`Deprem puanı yaklaşık ${data.composite} üzerinden 100`}
      >
        <span className="eq-badge__ring" aria-hidden>
          <svg viewBox="0 0 56 56" width="56" height="56">
            <circle cx="28" cy="28" r="24" fill="none" className="eq-badge__track" strokeWidth="6" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              className="eq-badge__prog"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(data.composite / 100) * 150.8} 150.8`}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <span className="eq-badge__val">{data.composite}</span>
        </span>
      </div>
      <div className="eq-badge__panel" role="status">
        <p className="eq-badge__title">Deprem özeti</p>
        <p className="eq-badge__band">{data.bandLabelTR}</p>
        <ul className="eq-badge__subs">
          {top.map((s) => (
            <li key={s.id}>
              <span>{s.label}</span>
              <strong>{s.score}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
